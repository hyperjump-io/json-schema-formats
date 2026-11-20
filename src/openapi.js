import { NumberFormatError } from "./diagnose.js";

/**
 * @import * as API from "./index.d.ts"
 */

/** @type API.isInt8 */
export const isInt8 = (n) => isIntegerIn(n, -128, 127);

/** @type API.assertInt8 */
export const assertInt8 = (n) => {
  if (!isInt8(n)) {
    throw new InvalidInt8Error(n);
  }
};

/**
 * A value isn't a signed 8-bit integer. {@link assertInt8} throws it.
 *
 * @hideconstructor
 */
export class InvalidInt8Error extends NumberFormatError {
  /** @param {number} value */
  constructor(value) {
    super("int8", value, ...integerProblem(value, -128, 127));
    this.name = "InvalidInt8Error";
  }
}

/** @type API.isInt16 */
export const isInt16 = (n) => isIntegerIn(n, -32768, 32767);

/** @type API.assertInt16 */
export const assertInt16 = (n) => {
  if (!isInt16(n)) {
    throw new InvalidInt16Error(n);
  }
};

/**
 * A value isn't a signed 16-bit integer. {@link assertInt16} throws it.
 *
 * @hideconstructor
 */
export class InvalidInt16Error extends NumberFormatError {
  /** @param {number} value */
  constructor(value) {
    super("int16", value, ...integerProblem(value, -32768, 32767));
    this.name = "InvalidInt16Error";
  }
}

/** @type API.isInt32 */
export const isInt32 = (n) => isIntegerIn(n, -2147483648, 2147483647);

/** @type API.assertInt32 */
export const assertInt32 = (n) => {
  if (!isInt32(n)) {
    throw new InvalidInt32Error(n);
  }
};

/**
 * A value isn't a signed 32-bit integer. {@link assertInt32} throws it.
 *
 * @hideconstructor
 */
export class InvalidInt32Error extends NumberFormatError {
  /** @param {number} value */
  constructor(value) {
    super("int32", value, ...integerProblem(value, -2147483648, 2147483647));
    this.name = "InvalidInt32Error";
  }
}

/** @type API.isUint8 */
export const isUint8 = (n) => isIntegerIn(n, 0, 255);

/** @type API.assertUint8 */
export const assertUint8 = (n) => {
  if (!isUint8(n)) {
    throw new InvalidUint8Error(n);
  }
};

/**
 * A value isn't an unsigned 8-bit integer. {@link assertUint8} throws it.
 *
 * @hideconstructor
 */
export class InvalidUint8Error extends NumberFormatError {
  /** @param {number} value */
  constructor(value) {
    super("uint8", value, ...integerProblem(value, 0, 255));
    this.name = "InvalidUint8Error";
  }
}

/** @type API.isUint16 */
export const isUint16 = (n) => isIntegerIn(n, 0, 65535);

/** @type API.assertUint16 */
export const assertUint16 = (n) => {
  if (!isUint16(n)) {
    throw new InvalidUint16Error(n);
  }
};

/**
 * A value isn't an unsigned 16-bit integer. {@link assertUint16} throws it.
 *
 * @hideconstructor
 */
export class InvalidUint16Error extends NumberFormatError {
  /** @param {number} value */
  constructor(value) {
    super("uint16", value, ...integerProblem(value, 0, 65535));
    this.name = "InvalidUint16Error";
  }
}

/** @type API.isUint32 */
export const isUint32 = (n) => isIntegerIn(n, 0, 4294967295);

/** @type API.assertUint32 */
export const assertUint32 = (n) => {
  if (!isUint32(n)) {
    throw new InvalidUint32Error(n);
  }
};

/**
 * A value isn't an unsigned 32-bit integer. {@link assertUint32} throws it.
 *
 * @hideconstructor
 */
export class InvalidUint32Error extends NumberFormatError {
  /** @param {number} value */
  constructor(value) {
    super("uint32", value, ...integerProblem(value, 0, 4294967295));
    this.name = "InvalidUint32Error";
  }
}

/** @type API.isDoubleInt */
export const isDoubleInt = (n) => Number.isSafeInteger(n);

/** @type API.assertDoubleInt */
export const assertDoubleInt = (n) => {
  if (!isDoubleInt(n)) {
    throw new InvalidDoubleIntError(n);
  }
};

/**
 * A value isn't an integer that a double can store without losing precision. {@link assertDoubleInt} throws it.
 *
 * @hideconstructor
 */
export class InvalidDoubleIntError extends NumberFormatError {
  /** @param {number} value */
  constructor(value) {
    super("double-int", value, ...integerProblem(value, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER));
    this.name = "InvalidDoubleIntError";
  }
}

/**
 * Whether `n` is an integer from `min` to `max`. `NaN` and `Infinity` aren't integers.
 *
 * @type (n: number, min: number, max: number) => boolean
 */
export const isIntegerIn = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

/**
 * The reason and words for an integer that isn't one from `min` to `max`.
 *
 * @type (n: number, min: number, max: number) => [reason: string, text: string]
 */
export const integerProblem = (n, min, max) => {
  return Number.isInteger(n)
    ? ["out-of-range", `it must be ${min} to ${max}`]
    : ["not-an-integer", "it isn't an integer"];
};
