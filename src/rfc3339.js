import { abnf } from "@hyperjump/abnf";
import { daysInMonth, hasLeapSecond } from "./date-math.js";
import {
  FormatError, delimiter, end, field, invalidCharacter, isProblem, matchEnd, missing, problem, sequence, show,
  sticky
} from "./diagnose.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem, Step } from "./diagnose.js"
 */

// RFC 3339, section 5.6. The ranges in the comments are written out as ABNF.
export const dateTimeRules = `
  date-fullyear   = 4DIGIT
  date-month      = "0" %x31-39 / "1" %x30-32 ; 01-12
  date-mday       = "0" %x31-39 / %x31-32 DIGIT / "3" %x30-31
                    ; 01-28, 01-29, 01-30, 01-31 based on
                    ; month/year
  time-hour       = %x30-31 DIGIT / "2" %x30-33 ; 00-23
  time-minute     = %x30-35 DIGIT ; 00-59
  time-second     = %x30-35 DIGIT / "60" ; 00-58, 00-59, 00-60 based on leap second
                    ; rules
  time-secfrac    = "." 1*DIGIT
  time-numoffset  = ("+" / "-") time-hour ":" time-minute
  time-offset     = "Z" / time-numoffset

  partial-time    = time-hour ":" time-minute ":" time-second
                    [time-secfrac]
  full-date       = date-fullyear "-" date-month "-" date-mday
  full-time       = partial-time time-offset

  date-time       = full-date "T" full-time
`;

const tag = abnf({ rules: dateTimeRules });

const datePattern = tag`full-date`;

/** @type (date: string) => Problem | undefined */
const checkDayInMonth = (date) => {
  const year = Number.parseInt(date.substring(0, 4), 10);
  const month = date.substring(5, 7);
  const day = Number.parseInt(date.substring(8, 10), 10);
  const days = daysInMonth(month, year);

  return day <= days
    ? undefined
    : problem("nonexistent-date", "day", 8, 10, `${date.substring(0, 7)} has ${days} days`);
};

/** @type API.isDate */
export const isDate = (date) => {
  return datePattern.test(date) && checkDayInMonth(date) === undefined;
};

/** @type API.assertDate */
export const assertDate = (date) => {
  if (!isDate(date)) {
    throw new InvalidDateError(date, diagnoseDate(date));
  }
};

/**
 * A value isn't a date. {@link assertDate} throws it.
 *
 * @hideconstructor
 */
export class InvalidDateError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("date", value, problem);
    this.name = "InvalidDateError";
  }
}

// Diagnosing

const digits = sticky(abnf({ anchored: false })`*DIGIT`);

/** @type Step[] */
const dateSteps = [
  field("year", digits, tag`date-fullyear`, "4 digits"),
  delimiter("-", "year", "month"),
  field("month", digits, tag`date-month`, "01-12"),
  delimiter("-", "month", "day"),
  field("day", digits, tag`date-mday`, "01-31")
];

/** @type (date: string) => Problem | undefined */
const diagnoseDate = (date) => {
  const result = sequence(date, 0, [...dateSteps, end("day")]);
  return isProblem(result) ? result : checkDayInMonth(date);
};

/**
 * The steps of a time-numoffset, after its sign.
 *
 * @type Step[]
 */
export const numericOffsetSteps = [
  field("offset hour", digits, tag`time-hour`, "00-23"),
  delimiter(":", "offset hour", "offset minute"),
  field("offset minute", digits, tag`time-minute`, "00-59")
];

/** @type Step */
const secfrac = (value, start) => {
  if (value[start] !== ".") {
    return start;
  }

  const fractionEnd = matchEnd(digits, value, start + 1);
  return fractionEnd > start + 1 ? fractionEnd : missing("fraction", start + 1, `it has no digits after "."`);
};

/** @type (after: string) => Step */
const timeOffset = (after) => (value, start) => {
  const char = value[start];
  if (char === "Z" || char === "z") {
    return start + 1;
  } else if (char === "+" || char === "-") {
    return sequence(value, start + 1, numericOffsetSteps);
  } else if (start === value.length) {
    return missing("offset", start);
  } else {
    return invalidCharacter(value, start, "offset", `after the ${after}`, `it must be "Z" or an offset like "+01:00"`);
  }
};

/** @type (second: Step) => Step */
const secondAndOffset = (second) => (value, start) => {
  const secondEnd = second(value, start);
  if (isProblem(secondEnd)) {
    return secondEnd;
  }

  const fractionEnd = secfrac(value, secondEnd);
  if (isProblem(fractionEnd)) {
    return fractionEnd;
  }

  return timeOffset(fractionEnd > secondEnd ? "fraction" : "second")(value, fractionEnd);
};

/** @type (second: Step) => Step[] */
const timeSteps = (second) => [
  field("hour", digits, tag`time-hour`, "00-23"),
  delimiter(":", "hour", "minute"),
  field("minute", digits, tag`time-minute`, "00-59"),
  delimiter(":", "minute", "second"),
  secondAndOffset(second)
];

// Without a date, a leap second can't be valid.
const timeSecondWithoutLeapSecond = `%x30-35 DIGIT`;

/**
 * @type API.isTime
 * @function
 */
export const isTime = RegExp.prototype.test.bind(tag`
  time-hour ":" time-minute ":" time-second [time-secfrac] time-offset
  time-second = ${timeSecondWithoutLeapSecond}
`);

/** @type API.assertTime */
export const assertTime = (time) => {
  if (!isTime(time)) {
    const second = field("second", digits, tag`${timeSecondWithoutLeapSecond}`, "00-59", "a leap second can't be checked without a date");
    const result = sequence(time, 0, [...timeSteps(second), end("offset")]);
    throw new InvalidTimeError(time, isProblem(result) ? result : undefined);
  }
};

/**
 * A value isn't a time. {@link assertTime} throws it.
 *
 * @hideconstructor
 */
export class InvalidTimeError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("time", value, problem);
    this.name = "InvalidTimeError";
  }
}

const dateTimePattern = tag`date-time`;

/** @type (dateTime: string) => Problem | undefined */
const checkLeapSecond = (dateTime) => {
  const date = dateTime.substring(0, 10);
  const time = dateTime.substring(11);

  return !time.startsWith("60", 6) || hasLeapSecond(new Date(`${date}T${time.substring(0, 6)}59${time.substring(8)}`))
    ? undefined
    : problem("nonexistent-leap-second", "second", 17, 19, "there was no leap second then", "a leap second is at 23:59:60 UTC, on a day that had one");
};

/** @type API.isDateTime */
export const isDateTime = (dateTime) => {
  return dateTimePattern.test(dateTime)
    && checkDayInMonth(dateTime) === undefined
    && checkLeapSecond(dateTime) === undefined;
};

/** @type API.assertDateTime */
export const assertDateTime = (dateTime) => {
  if (!isDateTime(dateTime)) {
    throw new InvalidDateTimeError(dateTime, diagnoseDateTime(dateTime));
  }
};

/**
 * A value isn't a date-time. {@link assertDateTime} throws it.
 *
 * @hideconstructor
 */
export class InvalidDateTimeError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("date-time", value, problem);
    this.name = "InvalidDateTimeError";
  }
}

/**
 * What's wrong with a date-time, which can be followed by what `after` allows.
 *
 * @type (dateTime: string, after?: Step) => Problem | undefined
 */
export const diagnoseDateTime = (dateTime, after = end("offset")) => {
  const result = sequence(dateTime, 0, [
    ...dateSteps,
    delimiter("T", "day", "time", true),
    ...timeSteps(field("second", digits, tag`time-second`, "00-59, or 60 for a leap second")),
    after
  ]);
  return isProblem(result) ? result : checkDayInMonth(dateTime) ?? checkLeapSecond(dateTime);
};

/**
 * @type API.isDuration
 * @function
 */
export const isDuration = RegExp.prototype.test.bind(abnf()`
  ; RFC 3339, appendix A, with the designators in upper case only
  duration   = %s"P" (dur-date / dur-time / dur-week)

  dur-second = 1*DIGIT %s"S"
  dur-minute = 1*DIGIT %s"M" [dur-second]
  dur-hour   = 1*DIGIT %s"H" [dur-minute]
  dur-time   = %s"T" (dur-hour / dur-minute / dur-second)
  dur-day    = 1*DIGIT %s"D"
  dur-week   = 1*DIGIT %s"W"
  dur-month  = 1*DIGIT %s"M" [dur-day]
  dur-year   = 1*DIGIT %s"Y" [dur-month]
  dur-date   = (dur-day / dur-month / dur-year) [dur-time]
`);

/** @type API.assertDuration */
export const assertDuration = (duration) => {
  if (!isDuration(duration)) {
    throw new InvalidDurationError(duration, diagnoseDuration(duration));
  }
};

/**
 * A value isn't a duration. {@link assertDuration} throws it.
 *
 * @hideconstructor
 */
export class InvalidDurationError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("duration", value, problem);
    this.name = "InvalidDurationError";
  }
}

// The units in the order they have to come in. A duration's units are a run of these with none skipped, like years and
// months but not years and days. Weeks can't be with any other unit.
/** @type Record<string, string>[] */
const dateUnits = [{ Y: "years" }, { M: "months" }, { D: "days" }];
/** @type Record<string, string>[] */
const timeUnits = [{ H: "hours" }, { M: "minutes" }, { S: "seconds" }];

/** @type (units: Record<string, string>[], designator: string) => number */
const rankOf = (units, designator) => units.findIndex((unit) => designator in unit);

/** @type (duration: string) => Problem | undefined */
const diagnoseDuration = (duration) => {
  if (duration[0] !== "P") {
    return duration === ""
      ? missing("P", 0, `it has no "P"`)
      : invalidCharacter(duration, 0, "P", "at the start", `a duration starts with "P"`);
  }

  let position = 1;
  let timeStart = -1;
  let weeks = false;
  /** @type string | undefined */
  let previous;
  let previousRank = -1;
  let count = 0;

  while (position < duration.length) {
    const units = timeStart === -1 ? dateUnits : timeUnits;

    if (duration[position] === "T") {
      if (timeStart !== -1) {
        return problem("invalid-order", "T", position, position + 1, `"T" can only be used once`);
      } else if (weeks) {
        return problem("invalid-order", "T", position, position + 1, `weeks can't be combined with other units`);
      }

      timeStart = position;
      previous = undefined;
      previousRank = -1;
      count = 0;
      position++;
      continue;
    }

    const numberEnd = matchEnd(digits, duration, position);
    if (numberEnd === position) {
      return rankOf(units, duration[position]) === -1 && duration[position] !== "W"
        ? invalidCharacter(duration, position, "number", "here", "a number must come before each unit")
        : missing("number", position, `${show(duration[position])} has no number before it`);
    } else if (numberEnd === duration.length) {
      return missing("unit", numberEnd, `${show(duration.slice(position, numberEnd))} has no unit after it`);
    }

    const designator = duration[numberEnd];
    const rank = rankOf(units, designator);
    if (designator === "W" && timeStart === -1) {
      if (count > 0) {
        return problem("invalid-order", "weeks", numberEnd, numberEnd + 1, `weeks can't be combined with other units`);
      }
      weeks = true;
    } else if (rank === -1) {
      const other = rankOf(timeStart === -1 ? timeUnits : dateUnits, designator);
      if (other !== -1 || designator === "W") {
        const name = designator === "W" ? "weeks" : (timeStart === -1 ? timeUnits : dateUnits)[other][designator];
        const where = timeStart === -1 ? `after "T"` : `before "T"`;
        return problem("invalid-order", name, numberEnd, numberEnd + 1, `${name} must come ${where}`);
      }

      const expected = timeStart === -1 ? `"Y", "M", "W", or "D"` : `"H", "M", or "S"`;
      return invalidCharacter(duration, numberEnd, "unit", "after a number", `a unit is ${expected}`);
    } else if (weeks) {
      const name = units[rank][designator];
      return problem("invalid-order", name, numberEnd, numberEnd + 1, `weeks can't be combined with other units`);
    } else if (previous !== undefined && rank !== previousRank + 1) {
      const name = units[rank][designator];
      const text = rank < previousRank + 1
        ? `${name} must come before ${previous}`
        : `${name} can't come after ${previous} without ${Object.values(units[previousRank + 1])[0]} between them`;
      return problem("invalid-order", name, numberEnd, numberEnd + 1, text);
    }

    previous = designator === "W" ? "weeks" : units[rank][designator];
    previousRank = rank;
    count++;
    position = numberEnd + 1;
  }

  if (count === 0) {
    return missing("unit", position, `it has no units after ${timeStart === -1 ? `"P"` : `"T"`}`);
  }
};
