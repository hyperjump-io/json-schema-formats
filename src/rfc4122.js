import { FormatError, delimiter, end, field, isProblem, sequence } from "./diagnose.js";
import { clockSeq, hexdigs, node, timeHighAndVersion, timeLow, timeMid, uuid as uuidPattern } from "./patterns.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/**
 * @type API.isUuid
 * @function
 */
export const isUuid = RegExp.prototype.test.bind(uuidPattern);

/** @type API.assertUuid */
export const assertUuid = (uuid) => {
  if (!isUuid(uuid)) {
    const result = sequence(uuid, 0, uuidSteps);
    throw new InvalidUuidError(uuid, isProblem(result) ? result : undefined);
  }
};

/**
 * A value isn't a UUID. {@link assertUuid} throws it.
 *
 * @hideconstructor
 */
export class InvalidUuidError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("uuid", value, problem);
    this.name = "InvalidUuidError";
  }
}

// Diagnosing

const uuidSteps = [
  field("first group", hexdigs, timeLow, "8 hex digits"),
  delimiter("-", "first group", "second group"),
  field("second group", hexdigs, timeMid, "4 hex digits"),
  delimiter("-", "second group", "third group"),
  field("third group", hexdigs, timeHighAndVersion, "4 hex digits"),
  delimiter("-", "third group", "fourth group"),
  field("fourth group", hexdigs, clockSeq, "4 hex digits"),
  delimiter("-", "fourth group", "fifth group"),
  field("fifth group", hexdigs, node, "12 hex digits"),
  end("fifth group")
];
