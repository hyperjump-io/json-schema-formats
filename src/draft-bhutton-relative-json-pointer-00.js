import { FormatError, invalidCharacter, matchEnd, missing, problem } from "./diagnose.js";
import { digits, relativeJsonPointer } from "./patterns.js";
import { diagnoseJsonPointer } from "./rfc6901.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/**
 * @type API.isRelativeJsonPointer
 * @function
 */
export const isRelativeJsonPointer = RegExp.prototype.test.bind(relativeJsonPointer);

/** @type API.assertRelativeJsonPointer */
export const assertRelativeJsonPointer = (pointer) => {
  if (!isRelativeJsonPointer(pointer)) {
    throw new InvalidRelativeJsonPointerError(pointer, diagnoseRelativeJsonPointer(pointer));
  }
};

/**
 * A value isn't a Relative JSON Pointer. {@link assertRelativeJsonPointer} throws it.
 *
 * @hideconstructor
 */
export class InvalidRelativeJsonPointerError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("relative-json-pointer", value, problem);
    this.name = "InvalidRelativeJsonPointerError";
  }
}

// Diagnosing

/**
 * A non-negative-integer at `start`: where it ends, or what's wrong.
 *
 * @type (value: string, start: number, part: string, after: string) => number | Problem
 */
const nonNegativeInteger = (value, start, part, after) => {
  const end = matchEnd(digits, value, start);
  if (end === start) {
    return start === value.length
      ? missing(part, start, `it has no number${after}`)
      : invalidCharacter(value, start, part, start === 0 ? "at the start" : after.trim(), "it must be a number");
  } else if (end > start + 1 && value[start] === "0") {
    return problem("invalid-value", part, start, end, "a number can't have a leading zero");
  }

  return end;
};

/** @type (pointer: string) => Problem | undefined */
const diagnoseRelativeJsonPointer = (pointer) => {
  const numberEnd = nonNegativeInteger(pointer, 0, "number", "");
  if (typeof numberEnd === "object") {
    return numberEnd;
  }

  const sign = pointer[numberEnd];
  if (sign === "#") {
    return numberEnd + 1 === pointer.length ? undefined : invalidCharacter(pointer, numberEnd + 1, "reference token", `after "#"`);
  } else if (sign === "+" || sign === "-") {
    const indexEnd = nonNegativeInteger(pointer, numberEnd + 1, "index manipulation", ` after ${JSON.stringify(sign)}`);
    if (typeof indexEnd === "object") {
      return indexEnd;
    } else if (pointer[indexEnd] === "#") {
      return invalidCharacter(pointer, indexEnd, "index manipulation", "after an index manipulation", `"#" can only follow the first number`);
    }
    return diagnoseJsonPointer(pointer, indexEnd);
  } else if (numberEnd < pointer.length && sign !== "/") {
    return invalidCharacter(pointer, numberEnd, "number", "after the number", `it must be "/", "#", "+", or "-"`);
  }

  return diagnoseJsonPointer(pointer, numberEnd);
};
