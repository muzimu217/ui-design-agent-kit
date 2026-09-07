import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIMENSIONS = ["relevance", "evidence", "rights", "fit", "efficiency"];
const WEIGHTS = { relevance: 8, evidence: 5, rights: 4, fit: 2, efficiency: 1 };
const ACCESS = new Set(["reachable", "partial", "blocked", "unknown"]);

function checkDimension(candidate, dimension) {
  const value = candidate?.[dimension];
  if (!Number.isInteger(value) || value < 0 || value > 5) {
    return `${dimension} must be an integer from 0 to 5`;
  }
  return undefined;
}

export function validateCandidate(candidate) {
  const errors = [];
  if (!candidate || typeof candidate !== "object") return ["candidate must be an object"];
  for (const key of ["id", "name", "url", "kind"]) {
    if (typeof candidate[key] !== "string" || candidate[key].trim() === "") {
      errors.push(`${key} must be a nonempty string`);
    }
  }
  if (!ACCESS.has(candidate.access)) errors.push("access must be reachable, partial, blocked, or unknown");
  for (const dimension of DIMENSIONS) {
    const error = checkDimension(candidate, dimension);
    if (error) errors.push(error);
  }
  return errors;
}

export function scoreCandidate(candidate) {
  const errors = validateCandidate(candidate);
  if (errors.length > 0) throw new Error(`${candidate?.id ?? "candidate"}: ${errors.join("; ")}`);
  const score = DIMENSIONS.reduce((total, dimension) => total + candidate[dimension] * WEIGHTS[dimension], 0);
  const explicitlyExcluded = candidate.rightsStatus === "prohibited"
    || candidate.trust === "untrusted" || candidate.placeholder === true;
  const bucket = explicitlyExcluded
    ? "excluded"
    : candidate.access !== "reachable" || candidate.rights < 3 || score < 70 ? "secondary" : "primary";
  return { ...candidate, score, bucket };
}

export function rankCandidates(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) throw new Error("candidates must be a nonempty array");
  const ids = candidates.map((candidate) => candidate?.id);
  if (ids.some((id) => typeof id !== "string" || id.trim() === "") || new Set(ids).size !== ids.length) {
    throw new Error("candidate ids must be distinct nonempty strings");
  }
  const ranked = candidates.map(scoreCandidate);
  const order = { primary: 0, secondary: 1, excluded: 2 };
  return ranked.sort((a, b) => order[a.bucket] - order[b.bucket] || b.score - a.score || a.id.localeCompare(b.id));
}

async function main() {
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf("--input");
  const input = inputIndex === -1 ? undefined : args[inputIndex + 1];
  if (!input) throw new Error("usage: node scripts/material-rank.mjs --input <candidate-json>");
  const parsed = JSON.parse(await readFile(path.resolve(input), "utf8"));
  const candidates = Array.isArray(parsed) ? parsed : parsed.candidates;
  const ranked = rankCandidates(candidates);
  console.log(JSON.stringify({
    primary: ranked.filter((item) => item.bucket === "primary"),
    secondary: ranked.filter((item) => item.bucket === "secondary"),
    excluded: ranked.filter((item) => item.bucket === "excluded"),
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    await main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
