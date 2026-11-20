import { FormatError, invalidCharacter, missing, problem } from "./diagnose.js";
import { ipv4Cidr as ipv4CidrPattern, ipv4PrefixLength } from "./patterns.js";
import { diagnoseIPv4 } from "./rfc2673.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/**
 * @type API.isIPv4Cidr
 * @function
 */
export const isIPv4Cidr = RegExp.prototype.test.bind(ipv4CidrPattern);

/** @type API.assertIPv4Cidr */
export const assertIPv4Cidr = (cidr) => {
  if (!isIPv4Cidr(cidr)) {
    throw new InvalidIPv4CidrError(cidr, diagnoseCidr(cidr, diagnoseIPv4, ipv4PrefixLength, 32));
  }
};

/**
 * A value isn't an IPv4 address with a prefix length. {@link assertIPv4Cidr} throws it.
 *
 * @hideconstructor
 */
export class InvalidIPv4CidrError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("ipv4-cidr", value, problem);
    this.name = "InvalidIPv4CidrError";
  }
}

// Diagnosing

/**
 * What's wrong with an address, "/", and a prefix length. The address is diagnosed by `diagnoseAddress`, and the prefix
 * length has to match `prefixLength`, which is 0 to `maximum`.
 *
 * @type (cidr: string, diagnoseAddress: (address: string) => Problem | undefined, prefixLength: RegExp, maximum: number) => Problem | undefined
 */
export const diagnoseCidr = (cidr, diagnoseAddress, prefixLength, maximum) => {
  const slash = cidr.indexOf("/");
  const addressProblem = diagnoseAddress(slash === -1 ? cidr : cidr.slice(0, slash));
  if (addressProblem !== undefined) {
    return addressProblem;
  } else if (slash === -1) {
    return missing("prefix length", cidr.length, `it has no "/" and prefix length`);
  }

  const start = slash + 1;
  const length = cidr.slice(start);
  const nonDigit = length.search(/\D/u);
  if (length === "") {
    return missing("prefix length", start, `it has no prefix length after "/"`);
  } else if (nonDigit !== -1) {
    return invalidCharacter(cidr, start + nonDigit, "prefix length");
  } else if (!prefixLength.test(length)) {
    const text = length.length > 1 && length.startsWith("0")
      ? "the prefix length can't have a leading zero"
      : `the prefix length must be 0-${maximum}`;
    return problem("invalid-value", "prefix length", start, cidr.length, text);
  }
};
