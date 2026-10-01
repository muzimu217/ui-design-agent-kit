import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import { sha256Hex, stableStringify } from "./package-schema.mjs";
import { ResearchRuntimeError } from "./errors.mjs";

export const EVENT_LOG_FILENAME = "events.jsonl";
export const EVENT_SCHEMA_VERSION = 1;
export const GENESIS_PREV_SHA = "0".repeat(64);

const HEX64 = /^[a-f0-9]{64}$/;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTimestamp(value) {
  return typeof value === "string" && value.length > 0 && !Number.isNaN(Date.parse(value));
}

// The sha of an event covers the canonical JSON of every field except `sha`
// itself, so any edit to a stored line invalidates that line's own hash.
function recordSha(record) {
  const { sha, ...hashed } = record;
  return sha256Hex(stableStringify(hashed));
}

function chainFailure(code, line, message) {
  return { ok: false, events: [], error: { code, line, message } };
}

function parseLines(content) {
  const lines = content.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

/**
 * Verify a JSONL event log end to end. Checks, per line and in order: JSON
 * shape, schemaVersion, ISO timestamp, fixed run id, sequential seq starting
 * at 0, actor/type/payload fields, prevSha linkage to the previous record
 * (genesis is 64 zeroes), and finally the record's own sha. Returns the first
 * failing line with a stable error code, or every parsed event on success.
 *
 * `expectedRunId` is optional; when omitted, every record must still share one
 * non-empty run id (taken from the first record).
 */
export async function verifyEventChain(filePath, expectedRunId = null) {
  if (!isNonEmptyString(filePath)) {
    throw new ResearchRuntimeError("ERR_INVALID_EVENT_LOG", "filePath must be a non-empty string", { field: "filePath" });
  }
  if (expectedRunId !== null && !isNonEmptyString(expectedRunId)) {
    throw new ResearchRuntimeError("ERR_INVALID_EVENT_LOG", "expectedRunId must be a non-empty string when provided", {
      expectedRunId: expectedRunId === undefined ? null : expectedRunId,
    });
  }

  let content;
  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return { ok: true, events: [] };
    throw error;
  }
  if (content !== "" && !content.endsWith("\n")) {
    return chainFailure("ERR_MALFORMED_LINE", content.split("\n").length, "event log must end with a newline");
  }

  const lines = parseLines(content);
  const events = [];
  let previousSha = GENESIS_PREV_SHA;
  let observedRunId = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = index + 1;
    const raw = lines[index].trim();
    if (raw === "") return chainFailure("ERR_MALFORMED_LINE", line, "blank line in event log");

    let record;
    try {
      record = JSON.parse(raw);
    } catch {
      return chainFailure("ERR_MALFORMED_LINE", line, "line is not valid JSON");
    }
    if (!isPlainObject(record)) {
      return chainFailure("ERR_MALFORMED_LINE", line, "line is not a JSON object");
    }
    if (record.schemaVersion !== EVENT_SCHEMA_VERSION) {
      return chainFailure("ERR_SCHEMA_VERSION", line, `schemaVersion must be ${EVENT_SCHEMA_VERSION}`);
    }
    if (!isValidTimestamp(record.ts)) {
      return chainFailure("ERR_INVALID_TIMESTAMP", line, "ts must be an ISO-8601 timestamp string");
    }
    if (!isNonEmptyString(record.runId)) {
      return chainFailure("ERR_RUN_ID_MISMATCH", line, "runId must be a non-empty string");
    }
    if (observedRunId === null) {
      observedRunId = record.runId;
    } else if (record.runId !== observedRunId) {
      return chainFailure("ERR_RUN_ID_MISMATCH", line, `event carries runId "${record.runId}" but the log belongs to "${observedRunId}"`);
    }
    if (expectedRunId !== null && record.runId !== expectedRunId) {
      return chainFailure("ERR_RUN_ID_MISMATCH", line, `event carries runId "${record.runId}" but "${expectedRunId}" was expected`);
    }
    if (!Number.isInteger(record.seq) || record.seq !== index) {
      return chainFailure("ERR_SEQ_NOT_SEQUENTIAL", line, `seq must be the increasing line index (${index})`);
    }
    if (!isNonEmptyString(record.actor) || !isNonEmptyString(record.type) || !isPlainObject(record.payload)) {
      return chainFailure("ERR_INVALID_EVENT_FIELD", line, "actor and type must be non-empty strings and payload must be an object");
    }
    if (record.prevSha !== previousSha) {
      return chainFailure("ERR_PREVSHA_MISMATCH", line, "prevSha does not match the previous event's sha");
    }
    if (typeof record.sha !== "string" || !HEX64.test(record.sha)) {
      return chainFailure("ERR_SHA_MISMATCH", line, "sha must be a 64-character hex digest");
    }
    if (recordSha(record) !== record.sha) {
      return chainFailure("ERR_SHA_MISMATCH", line, "sha does not match the canonical hash of the event");
    }

    previousSha = record.sha;
    events.push(record);
  }

  return { ok: true, events };
}

function defaultClock() {
  return new Date().toISOString();
}

/**
 * Append-only JSONL event log with a tamper-evident hash chain. Every append
 * re-verifies the existing file first; a damaged or externally modified log
 * rejects further writes. Actor/type legality is replay's concern — the log
 * only validates structure, so informational study events are storable.
 */
export class EventLog {
  constructor({ filePath, runId, clock = defaultClock } = {}) {
    if (!isNonEmptyString(filePath)) {
      throw new ResearchRuntimeError("ERR_INVALID_EVENT_LOG", "filePath must be a non-empty string", { field: "filePath" });
    }
    if (!isNonEmptyString(runId)) {
      throw new ResearchRuntimeError("ERR_INVALID_EVENT_LOG", "runId must be a non-empty string", { field: "runId" });
    }
    if (typeof clock !== "function") {
      throw new ResearchRuntimeError("ERR_INVALID_EVENT_LOG", "clock must be a function returning ISO timestamps", { field: "clock" });
    }
    this.filePath = filePath;
    this.runId = runId;
    this.clock = clock;
  }

  async append(event) {
    if (!isPlainObject(event)) {
      throw new ResearchRuntimeError("ERR_INVALID_EVENT_FIELD", "event must be an object with actor, type, and payload", {
        received: event === null ? null : typeof event,
      });
    }
    if (!isNonEmptyString(event.actor) || !isNonEmptyString(event.type)) {
      throw new ResearchRuntimeError("ERR_INVALID_EVENT_FIELD", "event actor and type must be non-empty strings", {
        actor: event.actor === undefined ? null : event.actor,
        type: event.type === undefined ? null : event.type,
      });
    }
    const payload = event.payload === undefined ? {} : event.payload;
    if (!isPlainObject(payload)) {
      throw new ResearchRuntimeError("ERR_INVALID_EVENT_FIELD", "event payload must be an object", { type: event.type });
    }

    const existing = await verifyEventChain(this.filePath, this.runId);
    if (!existing.ok) {
      throw new ResearchRuntimeError("ERR_EVENT_LOG_DAMAGED", "event log failed verification; refusing to append", {
        filePath: this.filePath,
        error: existing.error,
      });
    }
    const last = existing.events[existing.events.length - 1];

    const ts = this.clock();
    if (!isValidTimestamp(ts)) {
      throw new ResearchRuntimeError("ERR_INVALID_TIMESTAMP", "clock must return an ISO-8601 timestamp string", {
        received: typeof ts === "string" ? ts : typeof ts,
      });
    }

    const record = {
      schemaVersion: EVENT_SCHEMA_VERSION,
      ts,
      runId: this.runId,
      seq: last ? last.seq + 1 : 0,
      actor: event.actor,
      type: event.type,
      payload,
      prevSha: last ? last.sha : GENESIS_PREV_SHA,
    };

    let sha;
    let line;
    try {
      sha = recordSha(record);
      line = stableStringify({ ...record, sha });
    } catch {
      throw new ResearchRuntimeError("ERR_UNSERIALIZABLE_EVENT", "event must be canonical-JSON serializable", { type: event.type });
    }

    await mkdir(path.dirname(this.filePath), { recursive: true });
    await appendFile(this.filePath, `${line}\n`);
    return { ...record, sha };
  }

  async read() {
    let content;
    try {
      content = await readFile(this.filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
    const events = [];
    const lines = parseLines(content);
    for (let index = 0; index < lines.length; index += 1) {
      const raw = lines[index].trim();
      if (raw === "") {
        throw new ResearchRuntimeError("ERR_MALFORMED_LINE", "blank line in event log", { line: index + 1 });
      }
      try {
        events.push(JSON.parse(raw));
      } catch {
        throw new ResearchRuntimeError("ERR_MALFORMED_LINE", "line is not valid JSON", { line: index + 1 });
      }
    }
    return events;
  }

  async verify() {
    return verifyEventChain(this.filePath, this.runId);
  }
}
