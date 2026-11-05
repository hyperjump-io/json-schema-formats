import { FormatError, problem, unpositioned } from "./diagnose.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/** @type API.isRegex */
export const isRegex = (regex) => {
  return diagnoseRegex(regex) === undefined;
};

/** @type API.assertRegex */
export const assertRegex = (regex) => {
  const problem = diagnoseRegex(regex);
  if (problem !== undefined) {
    throw new InvalidRegexError(regex, problem);
  }
};

/**
 * A value isn't an ECMA-262 regular expression. {@link assertRegex} throws it.
 *
 * @hideconstructor
 */
export class InvalidRegexError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("regex", value, problem);
    this.name = "InvalidRegexError";
  }
}

// The engine says what's wrong, but not where. Its message starts with the pattern, which the error's message already
// has.
const enginePrefix = /^Invalid regular expression: \/.*\/[a-z]*: /su;

/** @type (regex: string) => Problem | undefined */
const diagnoseRegex = (regex) => {
  try {
    new RegExp(regex, "u");
    return undefined;
  } catch (error) {
    const text = error instanceof Error ? error.message.replace(enginePrefix, "") : String(error);
    return unpositioned(problem("invalid-syntax", "regex", 0, regex.length, text));
  }
};
