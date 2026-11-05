import { daysInMonth, hasLeapSecond } from "./date-math.js";
import {
  FormatError, delimiter, end, field, invalidCharacter, isProblem, matchEnd, missing, problem, sequence, show
} from "./diagnose.js";
import {
  dateFullyear, dateMday, dateMonth, dateTime as dateTimePattern, digits, duration as durationPattern, fullDate,
  time as timePattern, timeHour, timeMinute, timeSecond, timeSecondWithoutLeapSecond
} from "./patterns.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem, Step } from "./diagnose.js"
 */

// The number that two digits at `index` are. It's for values that a pattern matched, and is faster than making a
// substring to parse.
/** @type (value: string, index: number) => number */
const twoDigits = (value, index) => (value.charCodeAt(index) - 0x30) * 10 + value.charCodeAt(index + 1) - 0x30;

/** @type (date: string) => Problem | undefined */
const checkDayInMonth = (date) => {
  const day = twoDigits(date, 8);
  if (day <= 28) {
    return undefined;
  }

  const days = daysInMonth(twoDigits(date, 5), twoDigits(date, 0) * 100 + twoDigits(date, 2));
  return day <= days
    ? undefined
    : problem("nonexistent-date", "day", 8, 10, `${date.substring(0, 7)} has ${days} days`);
};

/** @type API.isDate */
export const isDate = (date) => {
  return fullDate.test(date) && checkDayInMonth(date) === undefined;
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

/** @type Step[] */
const dateSteps = [
  field("year", digits, dateFullyear, "4 digits"),
  delimiter("-", "year", "month"),
  field("month", digits, dateMonth, "01-12"),
  delimiter("-", "month", "day"),
  field("day", digits, dateMday, "01-31")
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
  field("offset hour", digits, timeHour, "00-23"),
  delimiter(":", "offset hour", "offset minute"),
  field("offset minute", digits, timeMinute, "00-59")
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
  field("hour", digits, timeHour, "00-23"),
  delimiter(":", "hour", "minute"),
  field("minute", digits, timeMinute, "00-59"),
  delimiter(":", "minute", "second"),
  secondAndOffset(second)
];

/**
 * @type API.isTime
 * @function
 */
export const isTime = RegExp.prototype.test.bind(timePattern);

/** @type API.assertTime */
export const assertTime = (time) => {
  if (!isTime(time)) {
    const second = field("second", digits, timeSecondWithoutLeapSecond, "00-59", "a leap second can't be checked without a date");
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

/** @type (dateTime: string) => Problem | undefined */
const checkLeapSecond = (dateTime) => {
  // The only second that starts with "6" is 60
  if (dateTime[17] !== "6") {
    return undefined;
  }

  const date = dateTime.substring(0, 10);
  const time = dateTime.substring(11);
  return hasLeapSecond(new Date(`${date}T${time.substring(0, 6)}59${time.substring(8)}`))
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
    ...timeSteps(field("second", digits, timeSecond, "00-59, or 60 for a leap second")),
    after
  ]);
  return isProblem(result) ? result : checkDayInMonth(dateTime) ?? checkLeapSecond(dateTime);
};

/**
 * @type API.isDuration
 * @function
 */
export const isDuration = RegExp.prototype.test.bind(durationPattern);

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
