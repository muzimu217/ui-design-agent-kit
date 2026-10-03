import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { stableStringify } from "./package-schema.mjs";
import { ResearchRuntimeError } from "./errors.mjs";
import { assignmentHash } from "./assignment.mjs";

const HEX64 = /^[a-f0-9]{64}$/;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return value !== null && typeof value === "string" && value.trim().length > 0;
}

function invalidArgument(field, message) {
  return new ResearchRuntimeError("ERR_INVALID_ARGUMENT", message, { field });
}

// The assignmentId doubles as the filename, so it must be a canonical sha256
// digest; anything else (including traversal shapes) is rejected outright.
function assignmentFilename(assignmentId) {
  if (!isNonEmptyString(assignmentId) || !HEX64.test(assignmentId)) {
    throw new ResearchRuntimeError(
      "ERR_INVALID_ASSIGNMENT",
      "assignmentId must be a 64-character sha256 hex digest",
      { field: "assignmentId", assignmentId: isNonEmptyString(assignmentId) ? assignmentId : null },
    );
  }
  return `${assignmentId}.json`;
}

function assertStorableAssignment(assignment) {
  if (!isPlainObject(assignment) || !Array.isArray(assignment.rows)) {
    throw new ResearchRuntimeError(
      "ERR_INVALID_ASSIGNMENT",
      "assignment must be an object with a rows array",
      { received: assignment === null ? null : typeof assignment },
    );
  }
  assignmentFilename(assignment.assignmentId);
  const recomputed = assignmentHash(assignment);
  if (recomputed !== assignment.assignmentHash) {
    throw new ResearchRuntimeError(
      "ERR_INVALID_ASSIGNMENT",
      "assignmentHash does not match the canonical hash of the assignment",
      {
        assignmentId: assignment.assignmentId,
        expected: recomputed,
        received: assignment.assignmentHash === undefined ? null : assignment.assignmentHash,
      },
    );
  }
}

// Shared load-side validation: the stored object must claim the id it is
// filed under, carry the summary fields listAssignments exposes, and match a
// freshly recomputed assignmentHash. Anything else is corruption.
function checkedAssignment(assignment, assignmentId, filePath) {
  if (!isPlainObject(assignment) || !Array.isArray(assignment.rows) || assignment.assignmentId !== assignmentId) {
    throw new ResearchRuntimeError("ERR_ASSIGNMENT_CORRUPT", "stored assignment does not match its store entry", {
      assignmentId,
      path: filePath,
      found: isPlainObject(assignment) && isNonEmptyString(assignment.assignmentId)
        ? assignment.assignmentId
        : null,
    });
  }
  if (!isNonEmptyString(assignment.studyId) || !isNonEmptyString(assignment.seed)) {
    throw new ResearchRuntimeError(
      "ERR_ASSIGNMENT_CORRUPT",
      "stored assignment must carry non-empty studyId and seed",
      { assignmentId, path: filePath },
    );
  }
  if (assignmentHash(assignment) !== assignment.assignmentHash) {
    throw new ResearchRuntimeError(
      "ERR_ASSIGNMENT_CORRUPT",
      "stored assignmentHash does not match the recomputed canonical hash",
      { assignmentId, path: filePath },
    );
  }
  return assignment;
}

async function readStoredAssignment(filePath, assignmentId) {
  let raw;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    // Only a missing file means "not stored". Other read failures must fail
    // closed instead of masquerading as ERR_ASSIGNMENT_MISSING.
    if (error.code === "ENOENT") {
      throw new ResearchRuntimeError("ERR_ASSIGNMENT_MISSING", "no assignment is stored under this id", {
        assignmentId,
        path: filePath,
      });
    }
    throw error;
  }

  let assignment;
  try {
    assignment = JSON.parse(raw);
  } catch {
    throw new ResearchRuntimeError("ERR_ASSIGNMENT_CORRUPT", "stored assignment is not valid JSON", {
      assignmentId,
      path: filePath,
    });
  }
  return checkedAssignment(assignment, assignmentId, filePath);
}

/**
 * Persist an assignment as canonical JSON at `<storeDir>/<assignmentId>.json`.
 * The store directory is created as needed; a file already existing under the
 * same assignmentId fails with ERR_ASSIGNMENT_EXISTS even when the bytes
 * would be identical — re-saving an id must fail closed, not overwrite.
 * Returns { path, assignmentId }.
 */
export async function saveAssignment(storeDir, assignment) {
  if (!isNonEmptyString(storeDir)) {
    throw invalidArgument("storeDir", "storeDir must be a non-empty string");
  }
  assertStorableAssignment(assignment);

  const filePath = path.join(storeDir, `${assignment.assignmentId}.json`);
  try {
    await mkdir(storeDir, { recursive: true });
    // Flag "wx" fails on any existing file, so the duplicate check and the
    // write are a single atomic step with no inspect-then-write race.
    await writeFile(filePath, `${stableStringify(assignment)}\n`, { flag: "wx" });
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new ResearchRuntimeError(
        "ERR_ASSIGNMENT_EXISTS",
        "an assignment is already stored under this id; duplicate writes must fail",
        { assignmentId: assignment.assignmentId, path: filePath },
      );
    }
    throw error;
  }
  return { path: filePath, assignmentId: assignment.assignmentId };
}

/**
 * Load and fully validate a stored assignment. Missing file →
 * ERR_ASSIGNMENT_MISSING; unparsable JSON, a content id that differs from the
 * requested one, or a recomputed assignmentHash mismatch →
 * ERR_ASSIGNMENT_CORRUPT. Returns the parsed assignment object.
 */
export async function loadAssignment(storeDir, assignmentId) {
  if (!isNonEmptyString(storeDir)) {
    throw invalidArgument("storeDir", "storeDir must be a non-empty string");
  }
  const filePath = path.join(storeDir, assignmentFilename(assignmentId));
  return readStoredAssignment(filePath, assignmentId);
}

/**
 * Summarize the store: one { assignmentId, studyId, seed, rowCount } entry per
 * stored assignment, sorted by assignmentId. Only `<sha256-hex>.json` files
 * count (operator notes are ignored, symlinks are never followed); a slot
 * that fails validation fails the whole listing with ERR_ASSIGNMENT_CORRUPT.
 * An absent store directory simply holds zero assignments.
 */
export async function listAssignments(storeDir) {
  if (!isNonEmptyString(storeDir)) {
    throw invalidArgument("storeDir", "storeDir must be a non-empty string");
  }

  let entries;
  try {
    entries = await readdir(storeDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const summaries = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const assignmentId = entry.name.slice(0, -".json".length);
    if (!HEX64.test(assignmentId)) continue;
    const filePath = path.join(storeDir, entry.name);
    const assignment = await readStoredAssignment(filePath, assignmentId);
    summaries.push({
      assignmentId,
      studyId: assignment.studyId,
      seed: assignment.seed,
      rowCount: assignment.rows.length,
    });
  }

  return summaries.sort((a, b) => (a.assignmentId < b.assignmentId ? -1 : 1));
}
