import { abnf } from "@hyperjump/abnf";
import { FormatError, invalidCharacter, isProblem, matchEnd, missing, problem, sequence, sticky } from "./diagnose.js";
import { dateTimeRules, diagnoseDateTime, isDateTime, numericOffsetSteps } from "./rfc3339.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem, Step } from "./diagnose.js"
 */

const suffixRules = `
  suffix            = [time-zone] *suffix-tag

  time-zone-initial = ALPHA / "." / "_"
  time-zone-char    = time-zone-initial / DIGIT / "-" / "+"
  time-zone-part    = (ALPHA / "_") *13time-zone-char
                    / "." (ALPHA / "_" / DIGIT / "-" / "+") *12time-zone-char
                    / ".." 1*12time-zone-char
                      ; time-zone-initial *13time-zone-char,
                      ; but not "." or ".."
  time-zone-name    = time-zone-part *("/" time-zone-part)
  time-zone         = "[" critical-flag
                          ( time-zone-name / time-numoffset ) "]"

  key-initial       = lcalpha / "_"
  key-char          = key-initial / DIGIT / "-"
  suffix-key        = key-initial *key-char
  suffix-value      = 1*alphanum
  suffix-values     = suffix-value *("-" suffix-value)
  suffix-tag        = "[" critical-flag
                          suffix-key "=" suffix-values "]"

  critical-flag     = [ "!" ]
  lcalpha           = %x61-7A
  alphanum          = ALPHA / DIGIT
`;

const suffixPattern = abnf({ rules: dateTimeRules })`suffix ${suffixRules}`;

/** @type API.isDateTimeExt */
export const isDateTimeExt = (dateTimeExt) => {
  const suffixStart = dateTimeExt.indexOf("[");
  if (suffixStart === -1) {
    return isDateTime(dateTimeExt);
  }

  return isDateTime(dateTimeExt.substring(0, suffixStart))
    && suffixPattern.test(dateTimeExt.substring(suffixStart));
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

const tag = abnf({ rules: dateTimeRules + suffixRules, anchored: false });
const timeZoneInitial = sticky(tag`time-zone-initial`);
const timeZoneChars = sticky(tag`*time-zone-char`);
const suffixKey = sticky(tag`suffix-key`);
const suffixValues = sticky(tag`suffix-values`);

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
