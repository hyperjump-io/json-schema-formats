import { abnf } from "@hyperjump/abnf";
import { FormatError, invalidCharacter, problem } from "./diagnose.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

export const jsonPointerRules = `
  json-pointer    = *( "/" reference-token )
  reference-token = *( unescaped / escaped )
  unescaped       = %x00-2E / %x30-7D / %x7F-10FFFF
     ; %x2F ('/') and %x7E ('~') are excluded from 'unescaped'
  escaped         = "~" ( "0" / "1" )
    ; representing '~' and '/', respectively
`;

/**
 * @type API.isJsonPointer
 * @function
 */
export const isJsonPointer = RegExp.prototype.test.bind(abnf()`json-pointer ${jsonPointerRules}`);

/** @type API.assertJsonPointer */
export const assertJsonPointer = (pointer) => {
  if (!isJsonPointer(pointer)) {
    throw new InvalidJsonPointerError(pointer, diagnoseJsonPointer(pointer, 0));
  }
};

/**
 * A value isn't a JSON Pointer. {@link assertJsonPointer} throws it.
 *
 * @hideconstructor
 */
export class InvalidJsonPointerError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("json-pointer", value, problem);
    this.name = "InvalidJsonPointerError";
  }
}

// Diagnosing

// Every character but "~" is allowed in a reference token, so a "~" that doesn't start an escape is the only problem
// there can be after the first "/"
const invalidEscape = /~(?![01])/gu;

/**
 * What's wrong with a JSON pointer that starts at `start`.
 *
 * @type (value: string, start: number) => Problem | undefined
 */
export const diagnoseJsonPointer = (value, start) => {
  if (start < value.length && value[start] !== "/") {
    return invalidCharacter(value, start, "reference token", "at the start", `a JSON pointer starts with "/"`);
  }

  invalidEscape.lastIndex = start;
  const escape = invalidEscape.exec(value);
  if (escape !== null) {
    const end = Math.min(escape.index + 2, value.length);
    return problem("invalid-escape", "reference token", escape.index, end, `"~" must be followed by "0" or "1"`);
  }
};
