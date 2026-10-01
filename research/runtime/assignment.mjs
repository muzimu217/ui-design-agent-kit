import { CONDITIONS, assertStudyPackage, canonicalHash } from "./package-schema.mjs";
import { ResearchRuntimeError } from "./errors.mjs";

const ASSIGNMENT_SCHEMA_VERSION = 1;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function assertIdList(value, field, missingCode) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ResearchRuntimeError(missingCode, `${field} must be a non-empty array of identifiers`, {
      field,
    });
  }
  const seen = new Set();
  for (const id of value) {
    if (!isNonEmptyString(id)) {
      throw new ResearchRuntimeError(missingCode, `${field} entries must be non-empty strings`, {
        field,
        value: id === undefined ? null : id,
      });
    }
    if (seen.has(id)) {
      throw new ResearchRuntimeError("ERR_DUPLICATE_ID", `duplicate identifier in ${field}: ${id}`, {
        field,
        id,
      });
    }
    seen.add(id);
  }
}

function assertAssignmentShape(assignment) {
  if (!isPlainObject(assignment) || !Array.isArray(assignment.rows)) {
    throw new ResearchRuntimeError("ERR_INVALID_ASSIGNMENT", "assignment must be an object with a rows array", {
      received: assignment === null ? null : typeof assignment,
    });
  }
}

export function createAssignment({
  study,
  studyHash,
  participantIds,
  taskIds,
  seed,
  createdAt = null,
  strict = true,
} = {}) {
  if (!isPlainObject(study)) {
    throw new ResearchRuntimeError("ERR_INVALID_STUDY_PACKAGE", "study must be a study package object", {
      field: "study",
    });
  }
  assertStudyPackage(study);

  const canonicalStudyHash = canonicalHash(study);
  if (!isNonEmptyString(studyHash) || studyHash !== canonicalStudyHash) {
    throw new ResearchRuntimeError(
      "ERR_STUDY_HASH_MISMATCH",
      "studyHash must match the canonical hash of the study package",
      { expected: canonicalStudyHash, received: studyHash || null },
    );
  }

  if (!isNonEmptyString(seed)) {
    throw new ResearchRuntimeError("ERR_SEED_REQUIRED", "seed must be a non-empty string", { field: "seed" });
  }

  assertIdList(participantIds, "participantIds", "ERR_MISSING_PARTICIPANTS");
  assertIdList(taskIds, "taskIds", "ERR_MISSING_TASKS");

  const knownTaskIds = new Set(study.tasks.map((task) => task.taskId));
  for (const taskId of taskIds) {
    if (!knownTaskIds.has(taskId)) {
      throw new ResearchRuntimeError(
        "ERR_UNKNOWN_TASK",
        `taskId is not declared in the study package: ${taskId}`,
        { taskId, knownTaskIds: [...knownTaskIds].sort() },
      );
    }
  }

  const participants = [...participantIds].sort();
  const tasks = [...taskIds].sort();

  if (strict && (participants.length % CONDITIONS.length !== 0 || tasks.length % CONDITIONS.length !== 0)) {
    throw new ResearchRuntimeError(
      "ERR_UNBALANCED_ASSIGNMENT",
      "strict balance requires an even number of participants and tasks",
      { participants: participants.length, tasks: tasks.length },
    );
  }

  const rows = [];
  let order = 0;
  for (let participantIndex = 0; participantIndex < participants.length; participantIndex += 1) {
    for (let taskIndex = 0; taskIndex < tasks.length; taskIndex += 1) {
      rows.push(
        Object.freeze({
          participantId: participants[participantIndex],
          taskId: tasks[taskIndex],
          condition: CONDITIONS[(participantIndex + taskIndex) % CONDITIONS.length],
          order,
        }),
      );
      order += 1;
    }
  }

  const assignmentId = canonicalHash({
    assignmentVersion: ASSIGNMENT_SCHEMA_VERSION,
    studyHash,
    seed,
    participantIds: participants,
    taskIds: tasks,
  });

  const core = {
    assignmentId,
    schemaVersion: ASSIGNMENT_SCHEMA_VERSION,
    studyId: study.studyId,
    studyHash,
    seed,
    createdAt,
    rows: Object.freeze(rows),
  };

  return Object.freeze({ ...core, assignmentHash: canonicalHash(core) });
}

export function assignmentHash(assignment) {
  assertAssignmentShape(assignment);
  const hashless = { ...assignment };
  delete hashless.assignmentHash;
  return canonicalHash(hashless);
}

export function assertAssignmentBalanced(assignment) {
  assertAssignmentShape(assignment);
  const perTask = new Map();
  const perParticipant = new Map();

  const bump = (map, key, condition) => {
    const counts = map.get(key) || { C0: 0, C1: 0 };
    counts[condition] += 1;
    map.set(key, counts);
  };

  for (const row of assignment.rows) {
    if (
      !isPlainObject(row) ||
      !isNonEmptyString(row.participantId) ||
      !isNonEmptyString(row.taskId) ||
      !CONDITIONS.includes(row.condition)
    ) {
      throw new ResearchRuntimeError(
        "ERR_INVALID_ASSIGNMENT",
        "assignment rows must contain participantId, taskId, and a known condition",
        { row },
      );
    }
    bump(perTask, row.taskId, row.condition);
    bump(perParticipant, row.participantId, row.condition);
  }

  const details = {};
  for (const [taskId, counts] of perTask) {
    if (counts.C0 !== counts.C1) {
      details.tasks = details.tasks || {};
      details.tasks[taskId] = counts;
    }
  }
  for (const [participantId, counts] of perParticipant) {
    if (counts.C0 !== counts.C1) {
      details.participants = details.participants || {};
      details.participants[participantId] = counts;
    }
  }

  if (details.tasks || details.participants) {
    throw new ResearchRuntimeError(
      "ERR_UNBALANCED_ASSIGNMENT",
      "assignment does not balance C0 and C1 within every task and participant",
      details,
    );
  }
}
