#!/usr/bin/env node
// CLI entrypoint for the research instrument core (research/runtime/*.mjs).
//
// Every command prints exactly one JSON result (successes on stdout; thrown
// runtime errors as JSON on stderr) and sets process.exitCode = 1 on failure,
// so scripts can branch on the exit code and parse the stable error codes.
// The CLI only reads repository fixtures and writes to explicit caller-owned
// directories; dry-run output is instrument self-test data, never participant
// evidence.

import { readFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";

import { assertStudyPackage, canonicalHash, validateStudyPackage } from "../research/runtime/package-schema.mjs";
import { ResearchRuntimeError } from "../research/runtime/errors.mjs";
import { assertAssignmentBalanced, createAssignment } from "../research/runtime/assignment.mjs";
import { loadAssignment, saveAssignment } from "../research/runtime/assignment-store.mjs";
import { verifyRun } from "../research/runtime/evidence-store.mjs";
import { replayRun } from "../research/runtime/replay.mjs";
import { runDryRun } from "../research/runtime/dry-run.mjs";
import { startSession } from "../research/runtime/session-runner.mjs";

const USAGE = `usage:
  research-instrument validate-package <package.json>
  research-instrument assign <package.json> <participants.json> <tasks.json> --seed <seed> [--save <storeDir>]
  research-instrument session <package.json> --assignment <assignmentId> --store <dir>
      --participant <id> --task <id> --out <dir> [--decisions approve,approve,approve]
  research-instrument dry-run <package.json> --out <dir>
  research-instrument replay <run-dir>
  research-instrument verify <run-dir>`;

function usageError(message) {
  return new ResearchRuntimeError("ERR_CLI_USAGE", message, { usage: USAGE });
}

function print(payload) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
}

async function readJsonFile(filePath, what) {
  let raw;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    throw new ResearchRuntimeError("ERR_CLI_INPUT", `cannot read ${what}: ${filePath}`, {
      path: filePath,
      cause: error.code,
    });
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new ResearchRuntimeError("ERR_CLI_INPUT", `${what} is not valid JSON: ${filePath}`, {
      path: filePath,
      cause: error.message,
    });
  }
}

function resolveIdList(input, { key, what, filePath }) {
  const value = Array.isArray(input) ? input : (input && input[key]);
  if (!Array.isArray(value) || value.length === 0 || value.some((id) => typeof id !== "string" || id.trim() === "")) {
    throw new ResearchRuntimeError("ERR_CLI_INPUT", `${what} must be a JSON array of non-empty identifiers (or {"${key}": [...]})`, {
      path: filePath,
      key,
    });
  }
  return value;
}

function parseArgv(argv) {
  const positional = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const inlineMatch = arg.match(/^--([^=]+)=(.*)$/);
    if (inlineMatch) {
      options[inlineMatch[1]] = inlineMatch[2];
      continue;
    }
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (next === undefined || next.startsWith("--")) {
      options[key] = true;
    } else {
      options[key] = next;
      index += 1;
    }
  }
  return { positional, options };
}

function expectPositional(positional, count, command) {
  if (positional.length !== count) {
    throw usageError(`${command} expects exactly ${count} positional argument${count === 1 ? "" : "s"}`);
  }
  return positional.map((value) => path.resolve(value));
}

async function cmdValidatePackage(positional) {
  const [packagePath] = expectPositional(positional, 1, "validate-package");
  const input = await readJsonFile(packagePath, "study package");
  const result = validateStudyPackage(input);
  if (!result.ok) {
    print({ ok: false, command: "validate-package", path: packagePath, errors: result.errors });
    process.exitCode = 1;
    return;
  }
  print({
    ok: true,
    command: "validate-package",
    path: packagePath,
    studyId: input.studyId,
    studyVersion: input.studyVersion,
    hash: result.hash,
  });
}

async function cmdAssign(positional, options) {
  const [packagePath, participantsPath, tasksPath] = expectPositional(positional, 3, "assign");
  if (typeof options.seed !== "string" || options.seed.trim() === "") {
    throw usageError("assign requires --seed <seed>");
  }
  const study = await readJsonFile(packagePath, "study package");
  const participantIds = resolveIdList(await readJsonFile(participantsPath, "participants file"), {
    key: "participantIds",
    what: "participants file",
    filePath: participantsPath,
  });
  const taskIds = resolveIdList(await readJsonFile(tasksPath, "tasks file"), {
    key: "taskIds",
    what: "tasks file",
    filePath: tasksPath,
  });

  const studyHash = canonicalHash(study);
  const assignment = createAssignment({ study, studyHash, participantIds, taskIds, seed: options.seed });
  assertAssignmentBalanced(assignment);
  let saved = null;
  if (options.save !== undefined) {
    if (typeof options.save !== "string" || options.save.trim() === "") {
      throw usageError("assign --save requires a store directory");
    }
    saved = await saveAssignment(path.resolve(options.save), assignment);
  }
  print({
    ok: true,
    command: "assign",
    balanced: true,
    studyHash,
    assignment,
    ...(saved ? { saved } : {}),
  });
}

// Scripted gate decisions for tests and non-interactive runs: a comma list of
// `approve` or `reject:<reason>` entries (reasons therefore cannot contain
// commas). One entry is consumed per gate round, so a reject-then-retry
// session legitimately needs more entries than there are gates.
function parseScriptedDecisions(rawValue) {
  const entries = rawValue.split(",").map((entry) => entry.trim()).filter((entry) => entry !== "");
  if (entries.length === 0) {
    throw usageError("--decisions must be a comma-separated list like approve,approve,approve");
  }
  return entries.map((entry) => {
    const match = entry.match(/^(approve|reject)(?::(.*))?$/);
    if (!match) {
      throw usageError(`invalid --decisions entry "${entry}" (use approve or reject:<reason>)`);
    }
    return match[1] === "reject" ? { decision: "reject", reason: match[2] ?? "" } : { decision: "approve" };
  });
}

function interactiveDecisionCallback() {
  return async ({ gate, phase }) => {
    for (;;) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      try {
        const answer = (await rl.question(`[${gate} · ${phase}] approve/reject? `)).trim().toLowerCase();
        if (answer === "approve") return { decision: "approve" };
        if (answer === "reject") {
          for (;;) {
            const reason = (await rl.question("拒绝原因（必填）: ")).trim();
            if (reason !== "") return { decision: "reject", reason };
            process.stdout.write("a rejection requires a non-empty reason\n");
          }
        }
        process.stdout.write('enter "approve" or "reject"\n');
      } finally {
        rl.close();
      }
    }
  };
}

async function cmdSession(positional, options) {
  const [packagePath] = expectPositional(positional, 1, "session");
  for (const flag of ["assignment", "store", "participant", "task", "out"]) {
    if (typeof options[flag] !== "string" || options[flag].trim() === "") {
      throw usageError(`session requires --${flag} <value>`);
    }
  }

  const study = await readJsonFile(packagePath, "study package");
  const { hash: studyHash } = assertStudyPackage(study);
  const assignment = await loadAssignment(path.resolve(options.store), options.assignment);
  const row = assignment.rows.find((entry) =>
    entry.participantId === options.participant && entry.taskId === options.task);
  if (!row) {
    throw new ResearchRuntimeError(
      "ERR_SESSION_UNASSIGNED",
      "the assignment has no row for this participant and task",
      {
        participantId: options.participant,
        taskId: options.task,
        assignmentId: assignment.assignmentId,
      },
    );
  }

  let decisions = null;
  let pendingScripted = null;
  if (options.decisions !== undefined) {
    if (typeof options.decisions !== "string" || options.decisions.trim() === "") {
      throw usageError("session --decisions requires a comma-separated list like approve,approve,approve");
    }
    const queue = parseScriptedDecisions(options.decisions);
    pendingScripted = [...queue];
    decisions = async () => {
      if (pendingScripted.length === 0) {
        throw new ResearchRuntimeError(
          "ERR_DECISIONS_MISMATCH",
          "scripted decisions ran out before the session ended",
          { provided: queue.length, consumed: queue.length },
        );
      }
      return pendingScripted.shift();
    };
  } else if (row.condition === "C1") {
    if (!process.stdin.isTTY) {
      throw usageError("session requires --decisions when stdin is not a TTY (C1 needs gate decisions)");
    }
    decisions = interactiveDecisionCallback();
  }

  const report = await startSession({
    studyPackage: study,
    studyHash,
    assignment,
    participantId: options.participant,
    taskId: options.task,
    condition: row.condition,
    runDir: path.resolve(options.out),
    decisions,
  });

  if (pendingScripted !== null && pendingScripted.length > 0) {
    throw new ResearchRuntimeError(
      "ERR_DECISIONS_MISMATCH",
      "scripted decisions left over after the session ended",
      { provided: pendingScripted.length + report.gateDecisions.length, consumed: report.gateDecisions.length },
    );
  }
  print({ ok: true, command: "session", ...report });
}

async function cmdDryRun(positional, options) {
  const [packagePath] = expectPositional(positional, 1, "dry-run");
  if (typeof options.out !== "string" || options.out.trim() === "") {
    throw usageError("dry-run requires --out <empty-or-absent directory>");
  }
  const study = await readJsonFile(packagePath, "study package");
  const { hash } = assertStudyPackage(study);
  const report = await runDryRun({ studyPackage: study, studyHash: hash, outDir: path.resolve(options.out) });
  print({ ok: true, command: "dry-run", ...report });
}

async function cmdReplay(positional) {
  const [runDir] = expectPositional(positional, 1, "replay");
  const result = await replayRun(runDir);
  print({ ok: result.errors.length === 0, command: "replay", runDir, ...result });
  if (result.errors.length > 0) process.exitCode = 1;
}

async function cmdVerify(positional) {
  const [runDir] = expectPositional(positional, 1, "verify");
  const result = await verifyRun(runDir);
  print({ ok: result.ok, command: "verify", runDir, errors: result.errors, manifest: result.manifest ?? null });
  if (!result.ok) process.exitCode = 1;
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { positional, options } = parseArgv(rest);
  switch (command) {
    case "validate-package":
      await cmdValidatePackage(positional);
      return;
    case "assign":
      await cmdAssign(positional, options);
      return;
    case "session":
      await cmdSession(positional, options);
      return;
    case "dry-run":
      await cmdDryRun(positional, options);
      return;
    case "replay":
      await cmdReplay(positional);
      return;
    case "verify":
      await cmdVerify(positional);
      return;
    case undefined:
      throw usageError("missing command");
    default:
      throw usageError(`unknown command: ${command}`);
  }
}

main().catch((error) => {
  const payload = error instanceof ResearchRuntimeError
    ? {
      ok: false,
      error: { code: error.code, message: error.message, details: error.details },
    }
    : {
      ok: false,
      error: { code: "ERR_CLI_INTERNAL", message: error.message },
    };
  process.stderr.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exitCode = 1;
});
