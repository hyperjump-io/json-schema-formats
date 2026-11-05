import { FormatError, invalidCharacter, missing, problem } from "./diagnose.js";
import { decOctet, ipv4Address } from "./patterns.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/**
 * @type API.isIPv4
 * @function
 */
export const isIPv4 = RegExp.prototype.test.bind(ipv4Address);

/** @type API.assertIPv4 */
export const assertIPv4 = (ip) => {
  if (!isIPv4(ip)) {
    throw new InvalidIPv4Error(ip, diagnoseIPv4(ip));
  }
};

/**
 * A value isn't an IPv4 address. {@link assertIPv4} throws it.
 *
 * @hideconstructor
 */
export class InvalidIPv4Error extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("ipv4", value, problem);
    this.name = "InvalidIPv4Error";
  }
}

// Diagnosing

const ordinals = ["first", "second", "third", "fourth"];

/** @type (ip: string) => Problem | undefined */
export const diagnoseIPv4 = (ip) => {
  const octets = ip.split(".");
  let start = 0;

  for (const [index, octet] of octets.entries()) {
    const end = start + octet.length;
    if (index === 4) {
      return problem("invalid-value", "octet", start - 1, ip.length, "an IPv4 address has 4 octets");
    } else if (octet === "") {
      return missing("octet", start, `it has no ${ordinals[index]} octet`);
    }

    const nonDigit = octet.search(/\D/u);
    if (nonDigit !== -1) {
      return invalidCharacter(ip, start + nonDigit, "octet", "in an IPv4 address");
    } else if (!decOctet.test(octet)) {
      const text = octet.length > 1 && octet.startsWith("0")
        ? `the ${ordinals[index]} octet can't have a leading zero`
        : `the ${ordinals[index]} octet must be 0-255`;
      return problem("invalid-value", "octet", start, end, text);
    }

    start = end + 1;
  }

  return octets.length < 4
    ? missing("octet", ip.length, `it has ${octets.length} ${octets.length === 1 ? "octet" : "octets"}; an IPv4 address has 4`)
    : undefined;
};
