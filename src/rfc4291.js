import { FormatError, invalidCharacter, missing, nest, problem } from "./diagnose.js";
import { ipv6Address, ipv6Cidr as ipv6CidrPattern, ipv6PrefixLength } from "./patterns.js";
import { diagnoseIPv4 } from "./rfc2673.js";
import { diagnoseCidr } from "./rfc4632.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/**
 * @type API.isIPv6
 * @function
 */
export const isIPv6 = RegExp.prototype.test.bind(ipv6Address);

/** @type API.assertIPv6 */
export const assertIPv6 = (ip) => {
  if (!isIPv6(ip)) {
    throw new InvalidIPv6Error(ip, diagnoseIPv6(ip));
  }
};

/**
 * A value isn't an IPv6 address. {@link assertIPv6} throws it.
 *
 * @hideconstructor
 */
export class InvalidIPv6Error extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("ipv6", value, problem);
    this.name = "InvalidIPv6Error";
  }
}

/**
 * @type API.isIPv6Cidr
 * @function
 */
export const isIPv6Cidr = RegExp.prototype.test.bind(ipv6CidrPattern);

/** @type API.assertIPv6Cidr */
export const assertIPv6Cidr = (cidr) => {
  if (!isIPv6Cidr(cidr)) {
    throw new InvalidIPv6CidrError(cidr, diagnoseCidr(cidr, diagnoseIPv6, ipv6PrefixLength, 128));
  }
};

/**
 * A value isn't an IPv6 address with a prefix length. {@link assertIPv6Cidr} throws it.
 *
 * @hideconstructor
 */
export class InvalidIPv6CidrError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("ipv6-cidr", value, problem);
    this.name = "InvalidIPv6CidrError";
  }
}

// Diagnosing

// The characters an IPv6 address can have, with the IPv4 address it can end with
const notAllowed = /[^\da-f:.]/iu;

/** @type (text: string, start: number) => { text: string, start: number }[] */
const groupsOf = (text, start) => {
  let groupStart = start;
  return text.split(":").map((group) => {
    const result = { text: group, start: groupStart };
    groupStart += group.length + 1;
    return result;
  });
};

/**
 * What's wrong with an IPv6 address. The groups are checked first, then how many there are.
 *
 * @type (ip: string) => Problem | undefined
 */
export const diagnoseIPv6 = (ip) => {
  if (ip === "") {
    return missing("group", 0, "it has no groups");
  }

  const bad = ip.search(notAllowed);
  if (bad !== -1) {
    return invalidCharacter(ip, bad, "group", "in an IPv6 address");
  }

  const triple = ip.indexOf(":::");
  if (triple !== -1) {
    return invalidCharacter(ip, triple + 2, "group", `after "::"`);
  }

  const elided = ip.indexOf("::");
  const second = elided === -1 ? -1 : ip.indexOf("::", elided + 2);
  if (second !== -1) {
    return problem("invalid-value", "group", second, second + 2, `"::" can only be used once`);
  }

  const groups = elided === -1
    ? groupsOf(ip, 0)
    : [
        ...elided === 0 ? [] : groupsOf(ip.slice(0, elided), 0),
        ...elided + 2 === ip.length ? [] : groupsOf(ip.slice(elided + 2), elided + 2)
      ];

  let count = 0;
  for (const { text, start } of groups) {
    if (text === "") {
      return missing("group", start, start === 0 ? `it has no group before ":"` : `it has no group after ":"`);
    } else if (text.includes(".")) {
      if (start + text.length !== ip.length) {
        return invalidCharacter(ip, start + text.indexOf("."), "group", "in a group", "an IPv4 address can only be at the end");
      }

      const ipv4 = diagnoseIPv4(text);
      if (ipv4 !== undefined) {
        return nest(ipv4, start);
      }
      count += 2;
    } else if (text.length > 4) {
      return problem("invalid-value", "group", start, start + text.length, "a group can't have more than 4 hex digits");
    } else {
      count++;
    }

    if (elided === -1 && count > 8) {
      return problem("invalid-value", "group", start, ip.length, "an IPv6 address has 8 groups");
    }
  }

  if (elided === -1) {
    return count < 8
      ? missing("group", ip.length, `it has ${count} ${count === 1 ? "group" : "groups"}; an IPv6 address has 8, or "::" in place of groups of zeros`)
      : undefined;
  } else {
    return count > 7
      ? problem("invalid-value", "group", elided, elided + 2, `"::" must stand for at least one group, and it has ${count} others`)
      : undefined;
  }
};
