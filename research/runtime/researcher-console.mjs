import { readdir } from "node:fs/promises";
import path from "node:path";

import { CONDITIONS } from "./package-schema.mjs";
import { ResearchRuntimeError } from "./errors.mjs";
import { MANIFEST_FILENAME } from "./constants.mjs";
import { EVENT_LOG_FILENAME, verifyEventChain } from "./event-log.mjs";
import { verifyRun } from "./evidence-store.mjs";
import { replayRun } from "./replay.mjs";

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Read-only condition probe: the first session_started event carries the
 * condition in its payload (the same convention replayRun relies on). An
 * unparseable or absent chain simply yields no condition.
 */
async function readCondition(eventsPath) {
  const chain = await verifyEventChain(eventsPath);
  const start = chain.events.find((event) => event.type === "session_started");
  const condition = start === undefined ? undefined : start.payload?.condition;
  return CONDITIONS.includes(condition) ? condition : undefined;
}

/**
 * Verify + replay one run directory and merge the three verdicts into a flat
 * summary. Every error entry is tagged with its source so an operator can
 * tell integrity damage (files/manifest), legality violations (state machine),
 * and replay failures apart. Data problems never throw here; an unexpected
 * failure is contained to this run as ERR_SCAN_FAILED instead of aborting the
 * whole scan.
 */
async function scanOneRun(runDir) {
  const entry = {
    runDir,
    condition: undefined,
    finalState: null,
    eventCount: 0,
    gateDecisionCount: 0,
    integrityOk: false,
    legalityOk: false,
    replayOk: false,
    errors: [],
  };
  try {
    const verification = await verifyRun(runDir);
    const replay = await replayRun(runDir);
    entry.condition = await readCondition(path.join(runDir, EVENT_LOG_FILENAME));
    entry.finalState = replay.finalState;
    entry.eventCount = replay.eventCount;
    entry.gateDecisionCount = replay.gateDecisions.length;
    entry.integrityOk = verification.ok;
    entry.legalityOk = verification.legality.ok;
    entry.replayOk = replay.errors.length === 0;
    entry.errors = [
      ...verification.errors.map((error) => ({ ...error, source: "integrity" })),
      ...verification.legality.errors.map((error) => ({ ...error, source: "legality" })),
      ...replay.errors.map((error) => ({ ...error, source: "replay" })),
    ];
  } catch (error) {
    entry.errors = [{
      source: "console",
      code: error.code || "ERR_SCAN_FAILED",
      message: error.message,
    }];
  }
  return entry;
}

/**
 * Recursively inventory run directories under `runsRoot` — any directory that
 * carries a `MANIFEST.sha256` — and report integrity, legality, and replay
 * verdicts per run. Symbolic links are never followed or reported, so a scan
 * cannot be pulled outside the root or double-count a linked run; results are
 * sorted by POSIX-style relative path for deterministic output. Strictly
 * read-only: nothing is written, fixed, or deleted anywhere under the root.
 * An absent root simply holds zero runs (same convention as listAssignments).
 *
 * Returns `{ runs: [{ runDir, condition?, finalState, eventCount,
 * gateDecisionCount, integrityOk, legalityOk, replayOk, errors }] }`.
 */
export async function scanRuns(runsRoot) {
  if (!isNonEmptyString(runsRoot)) {
    throw new ResearchRuntimeError("ERR_INVALID_ARGUMENT", "runsRoot must be a non-empty string", {
      field: "runsRoot",
    });
  }

  const root = path.resolve(runsRoot);
  const found = [];

  const walk = async (absolute, relative) => {
    let entries;
    try {
      entries = await readdir(absolute, { withFileTypes: true });
    } catch (error) {
      if (error.code === "ENOENT" && relative === "") return;
      throw error;
    }
    entries.sort((a, b) => (a.name < b.name ? -1 : 1));
    let hasManifest = false;
    for (const entry of entries) {
      // Symlinks are skipped entirely: never followed, never scanned.
      if (entry.isSymbolicLink()) continue;
      if (entry.isFile() && entry.name === MANIFEST_FILENAME) hasManifest = true;
      else if (entry.isDirectory()) {
        await walk(path.join(absolute, entry.name), relative ? `${relative}/${entry.name}` : entry.name);
      }
    }
    if (hasManifest) found.push({ runDir: absolute, relative });
  };

  await walk(root, "");
  found.sort((a, b) => (a.relative < b.relative ? -1 : 1));

  const runs = [];
  for (const { runDir } of found) {
    runs.push(await scanOneRun(runDir));
  }
  return { runs };
}
