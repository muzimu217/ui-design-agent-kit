import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { sha256Hex, stableStringify, CONDITIONS } from "./package-schema.mjs";
import { ResearchRuntimeError } from "./errors.mjs";
import { MANIFEST_FILENAME } from "./constants.mjs";
import { EVENT_LOG_FILENAME, verifyEventChain } from "./event-log.mjs";
import { STATE_CHANGING_EVENT_TYPES } from "./replay.mjs";
import { createSessionState, transition } from "./state-machine.mjs";

// Shared leaf constant; re-exported so existing importers (dry-run, tooling)
// keep one canonical source and the filename cannot drift again.
export { MANIFEST_FILENAME };
export const MANIFEST_SCHEMA_VERSION = 1;

const HEX64 = /^[a-f0-9]{64}$/;
const REQUIRED_METADATA_KEYS = Object.freeze(["studyHash", "assignmentHash", "eventLogHash"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function invalidArgument(field, message) {
  return new ResearchRuntimeError("ERR_INVALID_ARGUMENT", message, { field });
}

async function pathExists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

// The manifest and scratch output (hidden files, editor/OS droppings, partial
// writes) never count as run evidence.
function isExcludedName(name) {
  return name === MANIFEST_FILENAME || name.startsWith(".") || name.endsWith(".tmp");
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

// Recursively lists evidence files as POSIX-style relative paths. Symlinks are
// skipped: hashing through them could pull bytes from outside the run dir.
async function collectFiles(runDir, prefix = "") {
  const entries = (await readdir(runDir, { withFileTypes: true })).sort((a, b) => (a.name < b.name ? -1 : 1));
  const files = [];
  for (const entry of entries) {
    if (isExcludedName(entry.name)) continue;
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path.join(runDir, entry.name), relative)));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }
  return files;
}

function assertRelativeArtifactPath(runDir, relativePath) {
  if (!isNonEmptyString(relativePath)) {
    throw new ResearchRuntimeError("ERR_UNSAFE_PATH", "relativePath must be a non-empty string", {
      relativePath: relativePath === undefined ? null : relativePath,
    });
  }
  if (path.isAbsolute(relativePath)) {
    throw new ResearchRuntimeError("ERR_UNSAFE_PATH", "absolute paths are not allowed", { relativePath });
  }
  const segments = relativePath.split(/[\\/]+/).filter((segment) => segment.length > 0);
  if (segments.length === 0 || segments.some((segment) => segment === "..")) {
    throw new ResearchRuntimeError("ERR_UNSAFE_PATH", "paths may not escape the run directory", { relativePath });
  }
  const root = path.resolve(runDir);
  const absolute = path.resolve(root, ...segments);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) {
    throw new ResearchRuntimeError("ERR_UNSAFE_PATH", "resolved path escapes the run directory", {
      relativePath,
      resolved: absolute,
    });
  }
  return absolute;
}

/**
 * Write an artifact inside `runDir` at `relativePath`, creating parent
 * directories as needed. Absolute paths and `..` traversal are rejected, and
 * once MANIFEST.sha256 exists every write fails with ERR_RUN_FROZEN. Returns
 * the absolute path of the written artifact.
 */
export async function writeArtifact(runDir, relativePath, data) {
  if (!isNonEmptyString(runDir)) {
    throw invalidArgument("runDir", "runDir must be a non-empty string");
  }
  if (await pathExists(path.join(runDir, MANIFEST_FILENAME))) {
    throw new ResearchRuntimeError("ERR_RUN_FROZEN", "run is frozen; artifact writes are disabled", {
      runDir,
      manifest: MANIFEST_FILENAME,
    });
  }
  const absolute = assertRelativeArtifactPath(runDir, relativePath);
  if (typeof data !== "string" && !Buffer.isBuffer(data) && !(data instanceof Uint8Array)) {
    throw invalidArgument("data", "data must be a string, Buffer, or Uint8Array");
  }
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, data);
  return absolute;
}

function assertFreezeMetadata(metadata) {
  if (!isPlainObject(metadata)) {
    throw new ResearchRuntimeError("ERR_INVALID_METADATA", "metadata must be an object", {
      received: metadata === null ? null : typeof metadata,
    });
  }
  for (const key of REQUIRED_METADATA_KEYS) {
    if (typeof metadata[key] !== "string" || !HEX64.test(metadata[key])) {
      throw new ResearchRuntimeError("ERR_INVALID_METADATA", `${key} must be a 64-character sha256 hex digest`, {
        key,
        value: metadata[key] === undefined ? null : metadata[key],
      });
    }
  }
}

async function readEventLog(runDir) {
  const eventsPath = path.join(runDir, EVENT_LOG_FILENAME);
  const bytes = await readFile(eventsPath).catch(() => null);
  if (bytes === null) {
    throw new ResearchRuntimeError("ERR_EVENT_LOG_MISSING", `run has no ${EVENT_LOG_FILENAME} to freeze or verify`, {
      path: EVENT_LOG_FILENAME,
    });
  }
  return { eventsPath, bytes };
}

/**
 * Fold a run's event chain through the shared state machine — the exact fold
 * replayRun performs — and report illegal transitions or actors with their
 * seq. This is the machine expression of "tamper-evident ≠ forgery-proof":
 * the hash chain proves nothing was edited after the fact, but nothing stops
 * a forger from fabricating a perfectly chained event the state machine would
 * never allow (e.g. an agent-emitted gate_decision). Integrity ok with
 * legality not ok is therefore a valid output combination.
 *
 * An unverifiable chain fails closed: legality cannot be claimed for events
 * that cannot be established. A missing event log folds zero events and is
 * vacuously legal (integrity still fails on its own axis).
 */
async function foldLegality(eventsPath) {
  const chain = await verifyEventChain(eventsPath);
  if (!chain.ok) {
    return {
      ok: false,
      errors: [{ code: chain.error.code, line: chain.error.line, message: chain.error.message }],
    };
  }

  const errors = [];
  let state = null;

  for (const event of chain.events) {
    if (!STATE_CHANGING_EVENT_TYPES.has(event.type)) continue;

    if (state === null) {
      const session = event.type === "session_started" ? event.payload : null;
      if (!isPlainObject(session) || !CONDITIONS.includes(session.condition) ||
        !isNonEmptyString(session.participantId) || !isNonEmptyString(session.taskId)) {
        errors.push({
          code: "ERR_REPLAY_SESSION_INFO",
          seq: event.seq,
          message: "the first state-changing event must be a session_started carrying condition, participantId, and taskId",
        });
        break;
      }
      state = createSessionState({
        runId: event.runId,
        condition: session.condition,
        participantId: session.participantId,
        taskId: session.taskId,
      });
    }

    try {
      state = transition(state, { actor: event.actor, type: event.type, payload: event.payload }).state;
    } catch (error) {
      errors.push({
        code: error.code || "ERR_REPLAY_FAILED",
        seq: event.seq,
        type: event.type,
        message: error.message,
      });
      break;
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Freeze a run: verify the event log (hash chain and metadata.eventLogHash),
 * then write MANIFEST.sha256 covering every evidence file (sorted by relative
 * path, excluding the manifest itself, hidden files, and *.tmp). The manifest
 * is deterministic — no timestamps — so identical runs hash identically.
 * Freezing an already-frozen run fails with ERR_RUN_FROZEN.
 */
export async function freezeRun(runDir, metadata = {}) {
  if (!isNonEmptyString(runDir)) {
    throw invalidArgument("runDir", "runDir must be a non-empty string");
  }
  const manifestPath = path.join(runDir, MANIFEST_FILENAME);
  if (await pathExists(manifestPath)) {
    throw new ResearchRuntimeError("ERR_RUN_FROZEN", "run is already frozen", { runDir, manifest: MANIFEST_FILENAME });
  }
  assertFreezeMetadata(metadata);

  const { eventsPath, bytes } = await readEventLog(runDir);
  if (sha256Hex(bytes) !== metadata.eventLogHash) {
    throw new ResearchRuntimeError("ERR_EVENTLOG_HASH_MISMATCH", "metadata.eventLogHash does not match the event log contents", {
      expected: metadata.eventLogHash,
      actual: sha256Hex(bytes),
    });
  }
  const chain = await verifyEventChain(eventsPath);
  if (!chain.ok) {
    throw new ResearchRuntimeError("ERR_EVENT_CHAIN_BROKEN", "event log failed verification", {
      path: EVENT_LOG_FILENAME,
      error: chain.error,
    });
  }

  const files = [];
  for (const relative of (await collectFiles(runDir)).sort()) {
    const content = await readFile(path.join(runDir, relative));
    files.push(Object.freeze({
      path: relative,
      sha256: sha256Hex(content),
      bytes: content.length,
    }));
  }

  const manifest = Object.freeze({
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    metadata: Object.freeze({ ...metadata }),
    files: Object.freeze(files),
  });
  await mkdir(runDir, { recursive: true });
  await writeFile(manifestPath, `${stableStringify(manifest)}\n`);
  return manifest;
}

/**
 * Verify a frozen run: manifest shape and ordering, every listed file's hash
 * and size, no unlisted evidence files, required metadata digests,
 * metadata.eventLogHash against the actual log, and full event-chain
 * integrity. Independently of integrity, `legality` folds the verified event
 * chain through the shared state machine and reports illegal transitions or
 * actors — integrity ok with legality not ok is a valid combination (a
 * well-chained forged event passes integrity but fails legality). Returns
 * {ok, errors, manifest, legality}; never throws on data problems.
 */
export async function verifyRun(runDir) {
  if (!isNonEmptyString(runDir)) {
    throw invalidArgument("runDir", "runDir must be a non-empty string");
  }

  // Folded up front so every output shape below carries the same legality
  // verdict; the integrity path itself is untouched.
  const legality = await foldLegality(path.join(runDir, EVENT_LOG_FILENAME));

  const errors = [];
  const manifestPath = path.join(runDir, MANIFEST_FILENAME);
  let raw;
  try {
    raw = await readFile(manifestPath, "utf8");
  } catch {
    return {
      ok: false,
      errors: [{ code: "ERR_MANIFEST_MISSING", path: MANIFEST_FILENAME, message: "run has no MANIFEST.sha256" }],
      legality,
    };
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      errors: [{ code: "ERR_MANIFEST_INVALID", path: MANIFEST_FILENAME, message: "manifest is not valid JSON" }],
      legality,
    };
  }
  if (!isPlainObject(manifest) || manifest.schemaVersion !== MANIFEST_SCHEMA_VERSION ||
    !isPlainObject(manifest.metadata) || !Array.isArray(manifest.files)) {
    return {
      ok: false,
      errors: [{
        code: "ERR_MANIFEST_INVALID",
        path: MANIFEST_FILENAME,
        message: `manifest must carry schemaVersion ${MANIFEST_SCHEMA_VERSION}, metadata, and a files array`,
      }],
      legality,
    };
  }

  for (const key of REQUIRED_METADATA_KEYS) {
    if (typeof manifest.metadata[key] !== "string" || !HEX64.test(manifest.metadata[key])) {
      errors.push({
        code: "ERR_METADATA_INVALID",
        path: `metadata.${key}`,
        message: `${key} must be a 64-character sha256 hex digest`,
      });
    }
  }

  const listed = new Set();
  let previousPath = "";
  for (let index = 0; index < manifest.files.length; index += 1) {
    const entry = manifest.files[index];
    const entryPath = `files[${index}]`;
    if (!isPlainObject(entry) || !isNonEmptyString(entry.path) ||
      typeof entry.sha256 !== "string" || !HEX64.test(entry.sha256) || !Number.isInteger(entry.bytes)) {
      errors.push({ code: "ERR_MANIFEST_INVALID", path: entryPath, message: "entries must carry path, sha256, and bytes" });
      continue;
    }
    const unsafe = entry.path === MANIFEST_FILENAME ||
      entry.path.split("/").some((segment) => segment === "" || segment === "." || segment === "..");
    if (unsafe) {
      errors.push({ code: "ERR_MANIFEST_INVALID", path: `${entryPath}.path`, message: "manifest may only list safe relative paths" });
      continue;
    }
    if (listed.has(entry.path)) {
      errors.push({ code: "ERR_MANIFEST_INVALID", path: entryPath, message: `duplicate entry: ${entry.path}` });
      continue;
    }
    if (entry.path < previousPath) {
      errors.push({ code: "ERR_MANIFEST_UNORDERED", path: entryPath, message: "files must be sorted by path" });
    }
    previousPath = entry.path;
    listed.add(entry.path);

    const content = await readFile(path.join(runDir, ...entry.path.split("/"))).catch(() => null);
    if (content === null) {
      errors.push({ code: "ERR_FILE_MISSING", path: entry.path, message: "listed file is missing" });
      continue;
    }
    if (sha256Hex(content) !== entry.sha256 || content.length !== entry.bytes) {
      errors.push({ code: "ERR_FILE_HASH_MISMATCH", path: entry.path, message: "file contents do not match the manifest hash" });
    }
  }

  for (const relative of await collectFiles(runDir)) {
    if (!listed.has(relative)) {
      errors.push({ code: "ERR_UNLISTED_FILE", path: relative, message: "file is not listed in the manifest" });
    }
  }

  const { eventsPath, bytes } = await readEventLog(runDir).catch((error) => ({ error }));
  if (bytes === undefined) {
    errors.push({ code: "ERR_EVENT_LOG_MISSING", path: EVENT_LOG_FILENAME, message: `run has no ${EVENT_LOG_FILENAME}` });
  } else {
    if (!listed.has(EVENT_LOG_FILENAME)) {
      errors.push({ code: "ERR_UNLISTED_FILE", path: EVENT_LOG_FILENAME, message: "event log is not listed in the manifest" });
    }
    if (typeof manifest.metadata.eventLogHash === "string" && HEX64.test(manifest.metadata.eventLogHash) &&
      sha256Hex(bytes) !== manifest.metadata.eventLogHash) {
      errors.push({
        code: "ERR_EVENTLOG_HASH_MISMATCH",
        path: "metadata.eventLogHash",
        message: "eventLogHash does not match the event log contents",
      });
    }
    const chain = await verifyEventChain(eventsPath);
    if (!chain.ok) {
      errors.push({
        code: "ERR_EVENT_CHAIN_BROKEN",
        path: EVENT_LOG_FILENAME,
        line: chain.error.line,
        message: chain.error.message,
        details: chain.error,
      });
    }
  }

  return { ok: errors.length === 0, errors, manifest, legality };
}
