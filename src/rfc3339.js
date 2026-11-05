import { abnf } from "@hyperjump/abnf";
import { daysInMonth, hasLeapSecond } from "./date-math.js";

/**
 * @import * as API from "./index.d.ts"
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

/** @type (date: string) => boolean */
const isDayInMonth = (date) => {
  const year = Number.parseInt(date.substring(0, 4), 10);
  const month = date.substring(5, 7);
  const day = Number.parseInt(date.substring(8, 10), 10);

  return day <= daysInMonth(month, year);
};

/** @type API.isDate */
export const isDate = (date) => {
  return datePattern.test(date) && isDayInMonth(date);
};

/**
 * @type API.isTime
 * @function
 */
export const isTime = RegExp.prototype.test.bind(tag`
  time-hour ":" time-minute ":" time-second [time-secfrac] time-offset

  ; Without a date, a leap second can't be valid.
  time-second = %x30-35 DIGIT
`);

const dateTimePattern = tag`date-time`;

/** @type API.isDateTime */
export const isDateTime = (dateTime) => {
  if (!dateTimePattern.test(dateTime) || !isDayInMonth(dateTime)) {
    return false;
  }

  const date = dateTime.substring(0, 10);
  const time = dateTime.substring(11);

  return !time.startsWith("60", 6)
    || hasLeapSecond(new Date(`${date}T${time.substring(0, 6)}59${time.substring(8)}`));
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
