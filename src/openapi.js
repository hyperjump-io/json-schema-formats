import { FormatError, charAt, missing, problem } from "./diagnose.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/** @type API.isChar */
export const isChar = (char) => {
  return char.length === 1 || (char.length === 2 && /** @type number */ (char.codePointAt(0)) > 0xFFFF);
};

/** @type API.assertChar */
export const assertChar = (char) => {
  if (!isChar(char)) {
    throw new InvalidCharError(char, diagnoseChar(char));
  }
};

/**
 * A value isn't one character. {@link assertChar} throws it.
 *
 * @hideconstructor
 */
export class InvalidCharError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("char", value, problem);
    this.name = "InvalidCharError";
  }
}

// Diagnosing

/** @type (char: string) => Problem */
const diagnoseChar = (char) => {
  return char === ""
    ? missing("character", 0, "it has no character")
    : problem("too-long", "character", charAt(char, 0).length, char.length, "it has more than one character");
};
