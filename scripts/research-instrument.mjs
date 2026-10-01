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

import { assertStudyPackage, canonicalHash, validateStudyPackage } from "../research/runtime/package-schema.mjs";
import { ResearchRuntimeError } from "../research/runtime/errors.mjs";
import { assertAssignmentBalanced, createAssignment } from "../research/runtime/assignment.mjs";
import { verifyRun } from "../research/runtime/evidence-store.mjs";
import { replayRun } from "../research/runtime/replay.mjs";
import { runDryRun } from "../research/runtime/dry-run.mjs";

const USAGE = `usage:
  research-instrument validate-package <package.json>
  research-instrument assign <package.json> <participants.json> <tasks.json> --seed <seed>
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
  print({
    ok: true,
    command: "assign",
    balanced: true,
    studyHash,
    assignment,
  });
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
