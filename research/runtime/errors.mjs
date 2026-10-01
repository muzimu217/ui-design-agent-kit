export class ResearchRuntimeError extends Error {
  constructor(code, message, details = {}) {
    super(`${code}: ${message}`);
    this.name = "ResearchRuntimeError";
    this.code = code;
    this.details = details;
  }
}
