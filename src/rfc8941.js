import { FormatError, charAt, end, invalidCharacter, isProblem, matchEnd, missing, problem } from "./diagnose.js";
import {
  base64Chars, sfBinary as sfBinaryPattern, sfBoolean as sfBooleanPattern, sfString as sfStringPattern,
  sfToken as sfTokenPattern, sfTokenChars, sfUnescapedChars
} from "./patterns.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/**
 * @type API.isSfString
 * @function
 */
export const isSfString = RegExp.prototype.test.bind(sfStringPattern);

/** @type API.assertSfString */
export const assertSfString = (string) => {
  if (!isSfString(string)) {
    throw new InvalidSfStringError(string, diagnoseSfString(string));
  }
};

/**
 * A value isn't a structured field string. {@link assertSfString} throws it.
 *
 * @hideconstructor
 */
export class InvalidSfStringError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("sf-string", value, problem);
    this.name = "InvalidSfStringError";
  }
}

/**
 * @type API.isSfToken
 * @function
 */
export const isSfToken = RegExp.prototype.test.bind(sfTokenPattern);

/** @type API.assertSfToken */
export const assertSfToken = (token) => {
  if (!isSfToken(token)) {
    throw new InvalidSfTokenError(token, diagnoseSfToken(token));
  }
};

/**
 * A value isn't a structured field token. {@link assertSfToken} throws it.
 *
 * @hideconstructor
 */
export class InvalidSfTokenError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("sf-token", value, problem);
    this.name = "InvalidSfTokenError";
  }
}

/**
 * @type API.isSfBinary
 * @function
 */
export const isSfBinary = RegExp.prototype.test.bind(sfBinaryPattern);

/** @type API.assertSfBinary */
export const assertSfBinary = (binary) => {
  if (!isSfBinary(binary)) {
    throw new InvalidSfBinaryError(binary, diagnoseSfBinary(binary));
  }
};

/**
 * A value isn't a structured field byte sequence. {@link assertSfBinary} throws it.
 *
 * @hideconstructor
 */
export class InvalidSfBinaryError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("sf-binary", value, problem);
    this.name = "InvalidSfBinaryError";
  }
}

/**
 * @type API.isSfBoolean
 * @function
 */
export const isSfBoolean = RegExp.prototype.test.bind(sfBooleanPattern);

/** @type API.assertSfBoolean */
export const assertSfBoolean = (boolean) => {
  if (!isSfBoolean(boolean)) {
    throw new InvalidSfBooleanError(boolean, diagnoseSfBoolean(boolean));
  }
};

/**
 * A value isn't a structured field boolean. {@link assertSfBoolean} throws it.
 *
 * @hideconstructor
 */
export class InvalidSfBooleanError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("sf-boolean", value, problem);
    this.name = "InvalidSfBooleanError";
  }
}

// Diagnosing

/**
 * What's wrong with a value that has to start with `delimiter`, or undefined if it does. `missingText` is the message
 * for an empty value, and `hint` the hint for one that starts with something else.
 *
 * @type (value: string, delimiter: string, part: string, missingText: string, hint: string) => Problem | undefined
 */
const checkStart = (value, delimiter, part, missingText, hint) => {
  if (value === "") {
    return missing(part, 0, missingText);
  } else if (value[0] !== delimiter) {
    return invalidCharacter(value, 0, part, "at the start", hint);
  }
};

/** @type (string: string) => Problem | undefined */
const diagnoseSfString = (string) => {
  const startProblem = checkStart(string, "\"", "string", "it has no double quote", "a string starts with a double quote");
  if (startProblem !== undefined) {
    return startProblem;
  }

  let position = 1;
  while (true) {
    position = matchEnd(sfUnescapedChars, string, position);
    if (position === string.length) {
      return missing("string", position, "it has no closing double quote");
    } else if (string[position] === "\"") {
      const result = end("string")(string, position + 1);
      return isProblem(result) ? result : undefined;
    } else if (string[position] !== "\\") {
      return invalidCharacter(string, position, "string", "in the string", "a string can only have printable ASCII characters");
    }

    const escaped = string[position + 1];
    if (escaped !== "\"" && escaped !== "\\") {
      const escapeEnd = escaped === undefined ? position + 1 : position + 1 + charAt(string, position + 1).length;
      return problem("invalid-escape", "string", position, escapeEnd, "a backslash must be followed by a double quote or a backslash");
    }
    position += 2;
  }
};

/** @type (token: string) => Problem | undefined */
const diagnoseSfToken = (token) => {
  if (token === "") {
    return missing("token", 0, "it's empty");
  } else if (!/^[A-Za-z*]$/u.test(token[0])) {
    return invalidCharacter(token, 0, "token", "at the start", `a token starts with a letter or "*"`);
  }

  return invalidCharacter(token, matchEnd(sfTokenChars, token, 1), "token");
};

/** @type (binary: string) => Problem | undefined */
const diagnoseSfBinary = (binary) => {
  const startProblem = checkStart(binary, ":", "byte sequence", `it has no ":"`, `a byte sequence starts with ":"`);
  if (startProblem !== undefined) {
    return startProblem;
  }

  const dataEnd = matchEnd(base64Chars, binary, 1);
  if (dataEnd === binary.length) {
    return missing("byte sequence", dataEnd, `it has no closing ":"`);
  } else if (binary[dataEnd] !== ":") {
    return invalidCharacter(binary, dataEnd, "byte sequence", "in the byte sequence", `base64 has letters, digits, "+", "/", and "="`);
  }

  const result = end("byte sequence")(binary, dataEnd + 1);
  return isProblem(result) ? result : undefined;
};

/** @type (boolean: string) => Problem | undefined */
const diagnoseSfBoolean = (boolean) => {
  const startProblem = checkStart(boolean, "?", "boolean", `it has no "?"`, `a boolean starts with "?"`);
  if (startProblem !== undefined) {
    return startProblem;
  }

  if (boolean.length === 1) {
    return missing("boolean", 1, `it has no "0" or "1" after "?"`);
  } else if (boolean[1] !== "0" && boolean[1] !== "1") {
    return invalidCharacter(boolean, 1, "boolean", `after "?"`, `it must be "0" or "1"`);
  }

  const result = end("boolean")(boolean, 2);
  return isProblem(result) ? result : undefined;
};
