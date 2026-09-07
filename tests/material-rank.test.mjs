import test from "node:test";
import assert from "node:assert/strict";
import { rankCandidates, scoreCandidate } from "../scripts/material-rank.mjs";

const candidate = (overrides = {}) => ({
  id: "candidate",
  name: "Candidate",
  url: "https://example.com",
  kind: "reference",
  access: "reachable",
  relevance: 5,
  evidence: 5,
  rights: 5,
  fit: 5,
  efficiency: 5,
  ...overrides,
});

test("material score is deterministic and capped at 100", () => {
  assert.equal(scoreCandidate(candidate()).score, 100);
  assert.equal(scoreCandidate(candidate({ relevance: 4 })).score, 92);
});

test("blocked sources stay secondary even with a high score", () => {
  const ranked = rankCandidates([
    candidate({ id: "blocked", access: "blocked" }),
    candidate({ id: "reachable", relevance: 4 }),
  ]);
  assert.deepEqual(ranked.map((item) => [item.id, item.bucket]), [["reachable", "primary"], ["blocked", "secondary"]]);
});

test("low score and prohibited or untrusted material remain visible but cannot be primary", () => {
  const ranked = rankCandidates([
    candidate({ id: "low", relevance: 1, evidence: 1, rights: 1, fit: 1, efficiency: 1 }),
    candidate({ id: "prohibited", rightsStatus: "prohibited" }),
    candidate({ id: "untrusted", trust: "untrusted" }),
  ]);
  assert.equal(ranked.find((item) => item.id === "low").bucket, "secondary");
  assert.equal(ranked.find((item) => item.id === "prohibited").bucket, "excluded");
  assert.equal(ranked.find((item) => item.id === "untrusted").bucket, "excluded");
});

test("unclear rights keep a reachable candidate in secondary", () => {
  assert.equal(scoreCandidate(candidate({ rights: 2 })).bucket, "secondary");
});

test("invalid dimensions and duplicate ids fail loudly", () => {
  assert.throws(() => scoreCandidate(candidate({ evidence: 6 })), /evidence/);
  assert.throws(() => rankCandidates([candidate(), candidate()]), /distinct/);
});
