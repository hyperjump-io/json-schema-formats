import { isIdnHostname } from "idn-hostname";
import { FormatError, invalidCharacter, problem, unpositioned } from "./diagnose.js";
import { diagnoseHostname, isHostname } from "./rfc1123.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

// A label with "--" as its 3rd and 4th characters is reserved (R-LDH, RFC 5890 §2.3.1), like an A-label. A hostname
// with none, and with no more than 253 characters, is all NR-LDH labels, which IDNA2008 allows without checking them.
// Only the others need idn-hostname, which is slower.
const reservedLabel = /(?:^|\.)[\dA-Za-z-]{2}--/u;

/** @type API.isAsciiIdn */
export const isAsciiIdn = (hostname) => {
  return isHostname(hostname)
    && ((hostname.length <= 253 && !reservedLabel.test(hostname)) || isIdn(hostname));
};

/** @type API.assertAsciiIdn */
export const assertAsciiIdn = (hostname) => {
  if (!isAsciiIdn(hostname)) {
    throw new InvalidAsciiIdnError(hostname, diagnoseHostname(hostname) ?? diagnoseIdn(hostname));
  }
};

/**
 * A value isn't an IDNA2008 hostname of A-labels and NR-LDH labels. {@link assertAsciiIdn} throws it.
 *
 * @hideconstructor
 */
export class InvalidAsciiIdnError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("hostname", value, problem);
    this.name = "InvalidAsciiIdnError";
  }
}

const endsWithSeparator = /[\x2E．。｡]$/u;

// idn-hostname says why a hostname isn't valid, but not where, so it's what both the validator and the diagnosis use
/** @type API.isIdn */
export const isIdn = (hostname) => {
  return diagnoseIdn(hostname) === undefined;
};

/** @type API.assertIdn */
export const assertIdn = (hostname) => {
  if (!isIdn(hostname)) {
    throw new InvalidIdnError(hostname, diagnoseIdn(hostname));
  }
};

/**
 * A value isn't an IDNA2008 internationalized hostname. {@link assertIdn} throws it.
 *
 * @hideconstructor
 */
export class InvalidIdnError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("idn-hostname", value, problem);
    this.name = "InvalidIdnError";
  }
}

/** @type (hostname: string) => Problem | undefined */
export const diagnoseIdn = (hostname) => {
  if (endsWithSeparator.test(hostname)) {
    return invalidCharacter(hostname, hostname.length - 1, "hostname", "at the end");
  }

  try {
    return isIdnHostname(hostname) ? undefined : invalidIdn(hostname, "it isn't a valid IDN hostname");
  } catch (error) {
    return invalidIdn(hostname, error instanceof Error ? error.message : String(error));
  }
};

/** @type (hostname: string, text: string) => Problem */
const invalidIdn = (hostname, text) => unpositioned(problem("invalid-idn", "hostname", 0, hostname.length, text));
