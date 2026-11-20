// The number that two digits at `index` are. It's for values that a pattern matched, and is faster than making a
// substring to parse.
/** @type (value: string, index: number) => number */
export const twoDigits = (value, index) => (value.charCodeAt(index) - 0x30) * 10 + value.charCodeAt(index + 1) - 0x30;

// The days in each month, by its number. February is 28 here, and 29 in a leap year.
const monthLengths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** @type (month: number, year: number) => number */
export const daysInMonth = (month, year) => {
  return month === 2 && isLeapYear(year) ? 29 : monthLengths[month];
};

/** @type (year: number) => boolean */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
};

// The offset of each month, for dayOfWeek, by its number
const monthOffsets = [0, 0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];

/**
 * The day of the week of a date in the proleptic Gregorian calendar, from 0 for Sunday to 6 for Saturday. It's
 * Sakamoto's method. `Date` isn't used, because it takes years 0-99 to be 1900-1999.
 *
 * @type (year: number, month: number, day: number) => number
 */
export const dayOfWeek = (year, month, day) => {
  const y = month < 3 ? year - 1 : year;
  const days = y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + monthOffsets[month] + day;
  return ((days % 7) + 7) % 7;
};

/** @type (date: Date) => boolean */
export const hasLeapSecond = (date) => {
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const utcDate = `${date.getUTCFullYear()}-${month}-${day}`;
  return leapSecondDates.has(utcDate)
    && date.getUTCHours() === 23
    && date.getUTCMinutes() === 59;
};

const leapSecondDates = new Set([
  "1960-12-31",
  "1961-07-31",
  "1961-12-31",
  "1963-10-31",
  "1963-12-31",
  "1964-03-31",
  "1964-08-31",
  "1964-12-31",
  "1965-02-28",
  "1965-06-30",
  "1965-08-31",
  "1965-12-31",
  "1968-01-31",
  "1971-12-31",
  "1972-06-30",
  "1972-12-31",
  "1973-12-31",
  "1974-12-31",
  "1975-12-31",
  "1976-12-31",
  "1977-12-31",
  "1978-12-31",
  "1979-12-31",
  "1981-06-30",
  "1982-06-30",
  "1983-06-30",
  "1985-06-30",
  "1987-12-31",
  "1989-12-31",
  "1990-12-31",
  "1992-06-30",
  "1993-06-30",
  "1994-06-30",
  "1995-12-31",
  "1997-06-30",
  "1998-12-31",
  "2005-12-31",
  "2008-12-31",
  "2012-06-30",
  "2015-06-30",
  "2016-12-31"
]);
