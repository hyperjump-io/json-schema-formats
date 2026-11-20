import { FormatError, NumberFormatError, charAt, end, invalidCharacter, isProblem, matchEnd, missing, problem } from "./diagnose.js";
import { integerProblem, isIntegerIn } from "./registry.js";
import {
  base64Chars, base64Padding, sfBinary as sfBinaryPattern, sfBoolean as sfBooleanPattern, sfString as sfStringPattern,
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

/** @type API.isSfInteger */
export const isSfInteger = (n) => isIntegerIn(n, -999_999_999_999_999, 999_999_999_999_999);

/** @type API.assertSfInteger */
export const assertSfInteger = (n) => {
  if (!isSfInteger(n)) {
    throw new InvalidSfIntegerError(n);
  }
};

/**
 * A value isn't a structured field integer. {@link assertSfInteger} throws it.
 *
 * @hideconstructor
 */
export class InvalidSfIntegerError extends NumberFormatError {
  /** @param {number} value */
  constructor(value) {
    super("sf-integer", value, ...integerProblem(value, -999_999_999_999_999, 999_999_999_999_999));
    this.name = "InvalidSfIntegerError";
  }
}

/** @type API.isSfDecimal */
export const isSfDecimal = (n) => {
  return Number.isFinite(n) && Math.abs(n) < 1e12 && fractionDigits(n) <= 3;
};

/** @type API.assertSfDecimal */
export const assertSfDecimal = (n) => {
  if (!isSfDecimal(n)) {
    throw new InvalidSfDecimalError(n);
  }
};

/**
 * A value isn't a structured field decimal. {@link assertSfDecimal} throws it.
 *
 * @hideconstructor
 */
export class InvalidSfDecimalError extends NumberFormatError {
  /** @param {number} value */
  constructor(value) {
    super("sf-decimal", value, ...sfDecimalProblem(value));
    this.name = "InvalidSfDecimalError";
  }
}

/**
 * How many digits a number has after the point, in the shortest string that parses back to it, which is what `String`
 * gives. A small number's string has an exponent, like "1e-7", and the exponent moves the point. Arithmetic would be
 * wrong, since `1.005 * 1000` is `1004.9999999999999`.
 *
 * @type (n: number) => number
 */
const fractionDigits = (n) => {
  const [mantissa, exponent = "0"] = String(n).split("e");
  const fraction = mantissa.split(".")[1] ?? "";
  return Math.max(0, fraction.length - Number(exponent));
};

/** @type (n: number) => [reason: string, text: string] */
const sfDecimalProblem = (n) => {
  if (!Number.isFinite(n)) {
    return ["out-of-range", "it isn't a finite number"];
  } else if (Math.abs(n) >= 1e12) {
    return ["out-of-range", "it has more than 12 digits before the point"];
  } else {
    const digits = fractionDigits(n);
    return ["too-precise", `it has ${digits} digits after the point; an sf-decimal can have 3`];
  }
};

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
  const paddingEnd = matchEnd(base64Padding, binary, dataEnd);
  if (paddingEnd === binary.length) {
    return missing("byte sequence", paddingEnd, `it has no closing ":"`);
  } else if (binary[paddingEnd] !== ":") {
    const hint = paddingEnd > dataEnd && matchEnd(base64Chars, binary, paddingEnd) > paddingEnd
      ? `"=" can only be at the end`
      : `base64 has letters, digits, "+", "/", and "=" at the end`;
    return invalidCharacter(binary, paddingEnd, "byte sequence", "in the byte sequence", hint);
  }

  const result = end("byte sequence")(binary, paddingEnd + 1);
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
