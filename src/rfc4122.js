import { abnf } from "@hyperjump/abnf";
import { FormatError, delimiter, end, field, isProblem, sequence, sticky } from "./diagnose.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

const uuidRules = `
  UUID                   = time-low "-" time-mid "-"
                           time-high-and-version "-"
                           clock-seq-and-reserved
                           clock-seq-low "-" node
  time-low               = 4hexOctet
  time-mid               = 2hexOctet
  time-high-and-version  = 2hexOctet
  clock-seq-and-reserved = hexOctet
  clock-seq-low          = hexOctet
  node                   = 6hexOctet
  hexOctet               = HEXDIG HEXDIG
`;

/**
 * @type API.isUuid
 * @function
 */
export const isUuid = RegExp.prototype.test.bind(abnf()`UUID ${uuidRules}`);

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

const tag = abnf({ rules: uuidRules });
const hexdigs = sticky(abnf({ anchored: false })`*HEXDIG`);

const uuidSteps = [
  field("first group", hexdigs, tag`time-low`, "8 hex digits"),
  delimiter("-", "first group", "second group"),
  field("second group", hexdigs, tag`time-mid`, "4 hex digits"),
  delimiter("-", "second group", "third group"),
  field("third group", hexdigs, tag`time-high-and-version`, "4 hex digits"),
  delimiter("-", "third group", "fourth group"),
  field("fourth group", hexdigs, tag`clock-seq-and-reserved clock-seq-low`, "4 hex digits"),
  delimiter("-", "fourth group", "fifth group"),
  field("fifth group", hexdigs, tag`node`, "12 hex digits"),
  end("fifth group")
];
