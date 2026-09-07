import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildPrompt } from "./build-prompt.mjs";
import { ROOT } from "./verify.mjs";

const digest = (value) => createHash("sha256").update(value).digest("hex");
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;

export function createE3Packet(scenarios, suite, instructions) {
  if (!nonempty(suite?.id) || suite.mode !== "decision-only"
    || !Array.isArray(suite.scenarioIds) || suite.scenarioIds.length !== 3
    || new Set(suite.scenarioIds).size !== 3 || !nonempty(instructions)) {
    throw new Error("E3 requires a named decision-only suite, three distinct cases, and instructions");
  }
  if (!Array.isArray(scenarios)
    || scenarios.some((item) => !nonempty(item?.id))
    || new Set(scenarios.map((item) => item.id)).size !== scenarios.length) {
    throw new Error("Scenarios must have distinct nonempty ids");
  }
  // Keep grading criteria out of the packet shown to the evaluated agent.
  const cases = suite.scenarioIds.map((id) => {
    const item = scenarios.find((scenario) => scenario.id === id);
    if (!item || !nonempty(item.request) || !nonempty(item.context)) {
      throw new Error(`Missing or incomplete E3 scenario: ${id}`);
    }
    return { id, request: item.request, context: item.context };
  });
  return {
    suiteId: suite.id,
    mode: suite.mode,
    instructionsSha256: digest(instructions),
    casesSha256: digest(JSON.stringify(cases)),
    instructions,
    cases,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const scenarios = JSON.parse(await readFile(path.join(ROOT, "evals/scenarios.json"), "utf8"));
    const suite = JSON.parse(await readFile(path.join(ROOT, "evals/e3.json"), "utf8"));
    const packet = createE3Packet(scenarios, suite, await buildPrompt());
    const output = path.join(ROOT, "output/e3", `${digest(JSON.stringify(packet))}.json`);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify(packet, null, 2) + "\n");
    console.log(`Prepared decision-only inputs; no model or grader was run.\n${output}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
