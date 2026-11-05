import { FormatError, invalidCharacter, matchEnd, missing, problem } from "./diagnose.js";
import { hostname as domainPattern, letDigHyps } from "./patterns.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/** @type API.isHostname */
export const isHostname = (hostname) => {
  return hostname.length < 256 && domainPattern.test(hostname);
};

/** @type API.assertHostname */
export const assertHostname = (hostname) => {
  if (!isHostname(hostname)) {
    throw new InvalidHostnameError(hostname, diagnoseHostname(hostname));
  }
};

/**
 * A value isn't a hostname. {@link assertHostname} throws it.
 *
 * @hideconstructor
 */
export class InvalidHostnameError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("hostname", value, problem);
    this.name = "InvalidHostnameError";
  }
}

// Diagnosing

/**
 * What's wrong with the labels of a domain from `start` to `end`. A label is a run of what `chars` (a sticky pattern)
 * matches, without "-" at either end. `maxLength` is how long a label can be, if there's a limit.
 *
 * @type (value: string, start: number, end: number, part: string, chars: RegExp, maxLength?: number) => Problem | undefined
 */
export const diagnoseLabels = (value, start, end, part, chars, maxLength = Infinity) => {
  let labelStart = start;
  for (;;) {
    const dot = value.indexOf(".", labelStart);
    const labelEnd = dot === -1 || dot >= end ? end : dot;

    if (labelStart === labelEnd) {
      return start === end
        ? missing(part, start)
        : missing(part, labelStart, labelStart === start ? `it has no label before "."` : `it has no label after "."`);
    }

    const charsEnd = matchEnd(chars, value, labelStart);
    if (charsEnd < labelEnd) {
      return invalidCharacter(value, charsEnd, part, `in the ${part}`);
    } else if (value[labelStart] === "-") {
      return invalidCharacter(value, labelStart, part, "at the start of a label");
    } else if (value[labelEnd - 1] === "-") {
      return invalidCharacter(value, labelEnd - 1, part, "at the end of a label");
    } else if (labelEnd - labelStart > maxLength) {
      return problem("too-long", part, labelStart + maxLength, labelEnd, `a label can't be longer than ${maxLength} characters`);
    }

    if (labelEnd === end) {
      return undefined;
    }
    labelStart = labelEnd + 1;
  }
};

/** @type (hostname: string) => Problem | undefined */
export const diagnoseHostname = (hostname) => {
  return diagnoseLabels(hostname, 0, hostname.length, "hostname", letDigHyps, 63)
    ?? (hostname.length > 255
      ? problem("too-long", "hostname", 255, hostname.length, "a hostname can't be longer than 255 characters")
      : undefined);
};
