import { dayOfWeek, daysInMonth, hasLeapSecond } from "./date-math.js";
import {
  FormatError, charAt, delimiter, end, field, invalidCharacter, invalidValue, isProblem, matchEnd, missing, problem,
  sequence
} from "./diagnose.js";
import {
  alphas, digits, httpDate as httpDatePattern, httpDay, httpDayName, httpDayNameL, httpHour, httpMinute, httpMonth,
  httpOneDigitDay, httpSecond, httpTwoDigitYear, httpYear, mediaRange as mediaRangePattern, quotedPairChar,
  quotedStringChars, tchars
} from "./patterns.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem, Step } from "./diagnose.js"
 */

/** @type API.isHttpDate */
export const isHttpDate = (date) => {
  return httpDatePattern.test(date) && checkHttpDate(date) === undefined;
};

/** @type API.assertHttpDate */
export const assertHttpDate = (date) => {
  if (!isHttpDate(date)) {
    throw new InvalidHttpDateError(date, diagnoseHttpDate(date));
  }
};

/**
 * A value isn't an HTTP date. {@link assertHttpDate} throws it.
 *
 * @hideconstructor
 */
export class InvalidHttpDateError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("http-date", value, problem);
    this.name = "InvalidHttpDateError";
  }
}

/**
 * @type API.isMediaRange
 * @function
 */
export const isMediaRange = RegExp.prototype.test.bind(mediaRangePattern);

/** @type API.assertMediaRange */
export const assertMediaRange = (mediaRange) => {
  if (!isMediaRange(mediaRange)) {
    const result = sequence(mediaRange, 0, [
      token("type"),
      delimiter("/", "type", "subtype"),
      token("subtype"),
      parameters
    ]);
    throw new InvalidMediaRangeError(mediaRange, isProblem(result) ? result : undefined);
  }
};

/**
 * A value isn't a media range. {@link assertMediaRange} throws it.
 *
 * @hideconstructor
 */
export class InvalidMediaRangeError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("media-range", value, problem);
    this.name = "InvalidMediaRangeError";
  }
}

// Checking an HTTP date

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Where the parts of a date that the pattern matched are. An IMF-fixdate has "," after its day name, an asctime-date
 * has " ", and an rfc850-date has a longer day name. Only an rfc850-date's year has 2 digits.
 *
 * @typedef {{ dayNameEnd: number, day: number, month: number, year: number, yearLength: number, time: number }} Layout
 */

/** @type (date: string) => Layout */
const layoutOf = (date) => {
  if (date[3] === ",") {
    return { dayNameEnd: 3, day: 5, month: 8, year: 12, yearLength: 4, time: 17 };
  } else if (date[3] === " ") {
    return { dayNameEnd: 3, day: 8, month: 4, year: 20, yearLength: 4, time: 11 };
  } else {
    const comma = date.indexOf(",");
    return { dayNameEnd: comma, day: comma + 2, month: comma + 5, year: comma + 9, yearLength: 2, time: comma + 12 };
  }
};

/**
 * What's wrong with a date that the pattern matched, if anything: a day that isn't in its month, a day name that isn't
 * the date's, or a leap second when there wasn't one. An rfc850-date's year has no century, so its day name isn't
 * checked, and its leap second is only checked for being at 23:59:60.
 *
 * @type (date: string) => Problem | undefined
 */
const checkHttpDate = (date) => {
  const at = layoutOf(date);
  const day = Number(date.slice(at.day, at.day + 2));
  const monthName = date.slice(at.month, at.month + 3);
  const month = monthNames.indexOf(monthName) + 1;
  const yearText = date.slice(at.year, at.year + at.yearLength);
  const year = Number(yearText);

  // For a 2-digit year, this is the days in the month in a leap year if the year can be one in some century
  const days = daysInMonth(month, year);
  if (day === 0 || day > days) {
    const monthOfYear = at.yearLength === 4 ? `${monthName} ${yearText}` : `${monthName} of a year ending in ${yearText}`;
    const text = day === 0 ? "there's no day 00" : `${monthOfYear} has ${days} days`;
    return problem("nonexistent-date", "day", at.day, at.day + 2, text);
  }

  if (at.yearLength === 4) {
    const dayName = dayNames[dayOfWeek(year, month, day)];
    if (!dayName.startsWith(date.slice(0, at.dayNameEnd))) {
      const text = `${String(day).padStart(2, "0")} ${monthName} ${yearText} was a ${dayName}`;
      return problem("wrong-day-name", "day name", 0, at.dayNameEnd, text);
    }
  }

  const second = at.time + 6;
  if (date.slice(second, second + 2) === "60") {
    const hadOne = at.yearLength === 4
      ? hasLeapSecond(new Date(`${yearText}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${date.slice(at.time, at.time + 6)}59Z`))
      : date.slice(at.time, at.time + 5) === "23:59";
    if (!hadOne) {
      const hint = "a leap second is at 23:59:60 GMT, on a day that had one";
      return problem("nonexistent-leap-second", "second", second, second + 2, "there was no leap second then", hint);
    }
  }
};

// Diagnosing an HTTP date

/** @type (date: string) => Problem | undefined */
const diagnoseHttpDate = (date) => {
  const nameEnd = matchEnd(alphas, date, 0);
  if (nameEnd === 0) {
    return date === ""
      ? missing("day name", 0)
      : invalidCharacter(date, 0, "day name", "at the start", `an HTTP date starts with a day name, like "Sun"`);
  }

  const name = date.slice(0, nameEnd);
  /** @type Step[] */
  let steps;
  if (httpDayName.test(name)) {
    if (date[nameEnd] === ",") {
      steps = imfFixdateSteps;
    } else if (date[nameEnd] === " ") {
      steps = asctimeDateSteps;
    } else if (nameEnd === date.length) {
      return missing("day", nameEnd);
    } else {
      return invalidCharacter(date, nameEnd, "day name", "after the day name", `it must be "," or " "`);
    }
  } else if (httpDayNameL.test(name)) {
    steps = rfc850DateSteps;
  } else {
    const anyCase = [...dayNames, ...dayNames.map((dayName) => dayName.slice(0, 3))]
      .some((dayName) => dayName.toLowerCase() === name.toLowerCase());
    const hint = anyCase ? "day names are case-sensitive" : undefined;
    return invalidValue("day name", 0, nameEnd, `"Mon" to "Sun", or "Monday" to "Sunday"`, hint);
  }

  const result = sequence(date, nameEnd, steps);
  return isProblem(result) ? result : checkHttpDate(date);
};

/** @type Step */
const gmt = (value, start) => {
  for (let index = 0; index < 3; index++) {
    if (start + index === value.length) {
      return missing("time zone", start + index, `it has no "GMT"`);
    } else if (value[start + index] !== "GMT"[index]) {
      return invalidCharacter(value, start + index, "time zone", "in the time zone", `it must be "GMT"`);
    }
  }

  return start + 3;
};

/** @type Step[] */
const timeOfDaySteps = [
  field("hour", digits, httpHour, "00-23"),
  delimiter(":", "hour", "minute"),
  field("minute", digits, httpMinute, "00-59"),
  delimiter(":", "minute", "second"),
  field("second", digits, httpSecond, "00-59, or 60 for a leap second")
];

const monthField = field("month", alphas, httpMonth, `"Jan" to "Dec"`, "month names are case-sensitive");

/** @type Step[] */
const imfFixdateSteps = [
  delimiter(",", "day name", "day"),
  delimiter(" ", "day name", "day"),
  field("day", digits, httpDay, "2 digits"),
  delimiter(" ", "day", "month"),
  monthField,
  delimiter(" ", "month", "year"),
  field("year", digits, httpYear, "4 digits"),
  delimiter(" ", "year", "hour"),
  ...timeOfDaySteps,
  delimiter(" ", "second", "time zone"),
  gmt,
  end("time zone")
];

/** @type Step[] */
const rfc850DateSteps = [
  delimiter(",", "day name", "day"),
  delimiter(" ", "day name", "day"),
  field("day", digits, httpDay, "2 digits"),
  delimiter("-", "day", "month"),
  monthField,
  delimiter("-", "month", "year"),
  field("year", digits, httpTwoDigitYear, "2 digits"),
  delimiter(" ", "year", "hour"),
  ...timeOfDaySteps,
  delimiter(" ", "second", "time zone"),
  gmt,
  end("time zone")
];

// An asctime-date's day is 2 digits, or a space and 1 digit
/** @type Step */
const asctimeDay = (value, start) => {
  return value[start] === " "
    ? field("day", digits, httpOneDigitDay, "1 digit after a space")(value, start + 1)
    : field("day", digits, httpDay, "2 digits, or a space and 1 digit")(value, start);
};

/** @type Step[] */
const asctimeDateSteps = [
  delimiter(" ", "day name", "month"),
  monthField,
  delimiter(" ", "month", "day"),
  asctimeDay,
  delimiter(" ", "day", "hour"),
  ...timeOfDaySteps,
  delimiter(" ", "second", "year"),
  field("year", digits, httpYear, "4 digits"),
  end("year")
];

// Diagnosing a media range

/** @type (part: string) => Step */
const token = (part) => (value, start) => {
  const tokenEnd = matchEnd(tchars, value, start);
  if (tokenEnd > start) {
    return tokenEnd;
  }

  return start === value.length ? missing(part, start) : invalidCharacter(value, start, part);
};

/** @type (value: string, start: number) => number */
const skipOws = (value, start) => {
  let position = start;
  while (value[position] === " " || value[position] === "\t") {
    position++;
  }
  return position;
};

/** @type Step */
const quotedString = (value, start) => {
  let position = start + 1;
  while (true) {
    position = matchEnd(quotedStringChars, value, position);
    if (position === value.length) {
      return missing("parameter value", position, "it has no closing double quote");
    } else if (value[position] === "\"") {
      return position + 1;
    } else if (value[position] !== "\\") {
      return invalidCharacter(value, position, "parameter value", "in the quoted string");
    } else if (position + 1 === value.length) {
      return missing("parameter value", position + 1, "the backslash has nothing after it");
    }

    const escaped = charAt(value, position + 1);
    if (!quotedPairChar.test(escaped)) {
      return invalidCharacter(value, position + 1, "parameter value", "after a backslash");
    }
    position += 1 + escaped.length;
  }
};

/** @type Step */
const parameterSteps = (value, start) => {
  return sequence(value, start, [
    token("parameter name"),
    delimiter("=", "parameter name", "parameter value"),
    (value, start) => value[start] === "\"" ? quotedString(value, start) : token("parameter value")(value, start)
  ]);
};

/** @type Step */
const parameters = (value, start) => {
  let position = start;
  let previous = "subtype";
  while (position < value.length) {
    const semicolon = skipOws(value, position);
    if (value[semicolon] !== ";") {
      // Whitespace that isn't followed by ";" is the problem, if it's at the end
      const index = semicolon === value.length ? position : semicolon;
      return invalidCharacter(value, index, previous, `after the ${previous}`, `a parameter starts with ";"`);
    }

    position = skipOws(value, semicolon + 1);
    // A parameter is optional, so ";" can be followed by another ";", or by nothing
    if (position < value.length && value[position] !== ";") {
      const parameterEnd = parameterSteps(value, position);
      if (isProblem(parameterEnd)) {
        return parameterEnd;
      }
      position = parameterEnd;
      previous = "parameter value";
    }
  }

  return position;
};
