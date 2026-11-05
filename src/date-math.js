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
