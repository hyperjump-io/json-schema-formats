import { FormatError, invalidCharacter, isProblem, matchEnd, missing, problem, sequence } from "./diagnose.js";
import { dateTimeExt as dateTimeExtPattern, suffixKey, suffixValues, timeZoneChars, timeZoneInitial } from "./patterns.js";
import { checkDateTime, diagnoseDateTime, numericOffsetSteps } from "./rfc3339.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem, Step } from "./diagnose.js"
 */

/** @type API.isDateTimeExt */
export const isDateTimeExt = (dateTimeExt) => {
  return dateTimeExtPattern.test(dateTimeExt) && checkDateTime(dateTimeExt);
};

/** @type API.assertDateTimeExt */
export const assertDateTimeExt = (dateTimeExt) => {
  if (!isDateTimeExt(dateTimeExt)) {
    throw new InvalidDateTimeExtError(dateTimeExt, diagnoseDateTime(dateTimeExt, suffix));
  }
};

/**
 * A value isn't a date-time with an optional time zone and suffix tags. {@link assertDateTimeExt} throws it.
 *
 * @hideconstructor
 */
export class InvalidDateTimeExtError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("date-time", value, problem);
    this.name = "InvalidDateTimeExtError";
  }
}

// Diagnosing

/** @type Step */
const suffix = (value, start) => {
  let position = start;
  while (position < value.length) {
    if (value[position] !== "[") {
      const after = position === start ? "offset" : "suffix tag";
      return invalidCharacter(value, position, after, position === start ? "after the offset" : `after "]"`);
    }

    const close = value.indexOf("]", position);
    const contentStart = value[position + 1] === "!" ? position + 2 : position + 1;
    const contentEnd = close === -1 ? value.length : close;
    const isTag = value.slice(contentStart, contentEnd).includes("=");
    const part = position === start && !isTag ? "time zone" : "suffix tag";

    const result = isTag
      ? suffixTag(value, contentStart, contentEnd)
      : position === start
        ? timeZone(value, contentStart, contentEnd)
        : problem("invalid-value", part, position, close === -1 ? value.length : close + 1, `a suffix tag must have "="`, "only the first suffix can be a time zone");
    if (isProblem(result)) {
      return result;
    } else if (close === -1) {
      return missing(part, value.length, `it has no "]"`);
    }

    position = close + 1;
  }

  return position;
};

/** @type (value: string, start: number, end: number) => Problem | undefined */
const timeZone = (value, start, end) => {
  if (value[start] === "+" || value[start] === "-") {
    const offsetEnd = sequence(value, start + 1, numericOffsetSteps);
    if (isProblem(offsetEnd)) {
      return offsetEnd;
    }
    return offsetEnd === end ? undefined : invalidCharacter(value, offsetEnd, "time zone", "after the offset minute");
  }

  let partStart = start;
  for (;;) {
    const slash = value.indexOf("/", partStart);
    const partEnd = slash === -1 || slash > end ? end : slash;
    const name = value.slice(partStart, partEnd);

    if (partStart === partEnd) {
      return missing("time zone", partStart, partStart === start ? "it has no time zone" : "a time zone name can't have an empty part");
    } else if (matchEnd(timeZoneInitial, value, partStart) === partStart) {
      return invalidCharacter(value, partStart, "time zone", "at the start of a time zone name's part");
    }

    const charsEnd = matchEnd(timeZoneChars, value, partStart + 1);
    if (charsEnd < partEnd) {
      return invalidCharacter(value, charsEnd, "time zone");
    } else if (name === "." || name === "..") {
      return problem("invalid-value", "time zone", partStart, partEnd, `a time zone name's part can't be ${JSON.stringify(name)}`);
    } else if (name.length > 14) {
      return problem("too-long", "time zone", partStart + 14, partEnd, "a time zone name's part can't be longer than 14 characters");
    }

    if (partEnd === end) {
      return undefined;
    }
    partStart = partEnd + 1;
  }
};

/** @type (value: string, start: number, end: number) => Problem | undefined */
const suffixTag = (value, start, end) => {
  const keyEnd = matchEnd(suffixKey, value, start);
  if (keyEnd === start) {
    return value[start] === "="
      ? missing("suffix tag", start, `it has no key before "="`)
      : invalidCharacter(value, start, "suffix tag", "at the start of a key", `a key starts with a lowercase letter or "_"`);
  } else if (value[keyEnd] !== "=") {
    return invalidCharacter(value, keyEnd, "suffix tag", "in a key");
  }

  const valuesEnd = matchEnd(suffixValues, value, keyEnd + 1);
  if (valuesEnd === keyEnd + 1 && valuesEnd === end) {
    return missing("suffix tag", valuesEnd, `it has no value after "="`);
  }
  return valuesEnd === end ? undefined : invalidCharacter(value, valuesEnd, "suffix tag", "in a value");
};
