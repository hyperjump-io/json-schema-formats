import { daysInMonth, hasLeapSecond } from "./date-math.js";

const dateFullyear = `\\d{4}`;
const dateMonth = `(?:0[1-9]|1[0-2])`; // 01-12
const dateMday = `(?:0[1-9]|[12][0-9]|3[01])`; // 01-28, 01-29, 01-30, 01-31 based on month/year
const fullDate = `(?<year>${dateFullyear})-(?<month>${dateMonth})-(?<day>${dateMday})`;

const datePattern = new RegExp(`^${fullDate}$`);

/**
 * The 'date' format. Validates that a string represents a date according to
 * [RFC 3339, section 5.6](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6).
 *
 * @see [JSON Schema Core, section 7.3.1](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.1)
 *
 * @param {string} date
 * @returns {boolean}
 */
export const isDate = (date) => {
  const parsedDate = datePattern.exec(date)?.groups;
  if (!parsedDate) {
    return false;
  }

  const day = Number.parseInt(parsedDate.day, 10);
  const year = Number.parseInt(parsedDate.year, 10);

  return day <= daysInMonth(parsedDate.month, year);
};

const timeHour = `(?:[01]\\d|2[0-3])`; // 00-23
const timeMinute = `[0-5]\\d`; // 00-59
const timeSecond = `[0-5]\\d`; // 00-59
const timeSecondAllowLeapSeconds = `(?<seconds>[0-5]\\d|60)`; // 00-58, 00-59, 00-60 based on leap second rules
const timeSecfrac = `\\.\\d+`;
const timeNumoffset = `[+-]${timeHour}:${timeMinute}`;
const timeOffset = `(?:[zZ]|${timeNumoffset})`;
const partialTime = `${timeHour}:${timeMinute}:${timeSecond}(?:${timeSecfrac})?`;
const fullTime = `${partialTime}${timeOffset}`;

/**
 * The 'time' format. Validates that a string represents a time according to
 * [RFC 3339, section 5.6](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6).
 *
 * **NOTE**: Leap seconds are only allowed on specific dates. Since there is no date
 * in this context, leap seconds are never allowed.
 *
 * @see [JSON Schema Core, section 7.3.1](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.1)
 *
 * @function
 */
export const isTime = RegExp.prototype.test.bind(new RegExp(`^${fullTime}$`));

const timePattern = new RegExp(`^${timeHour}:${timeMinute}:${timeSecondAllowLeapSeconds}(?:${timeSecfrac})?${timeOffset}$`);

/** @type (time: string) => { seconds: string } | undefined */
const parseTime = (time) => {
  return /** @type {{ seconds: string } | undefined} */ (timePattern.exec(time)?.groups);
};

/**
 * The 'date-time' format. Validates that a string represents a date-time
 * according to [RFC 3339, section 5.6](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6).
 *
 * @see [JSON Schema Core, section 7.3.1](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.1)
 *
 * @param {string} dateTime
 * @returns {boolean}
 */
export const isDateTime = (dateTime) => {
  const date = dateTime.substring(0, 10);
  const t = dateTime[10];
  const time = dateTime.substring(11);
  const seconds = parseTime(time)?.seconds;

  return isDate(date)
    && /^t$/i.test(t)
    && !!seconds
    && (seconds !== "60" || hasLeapSecond(new Date(`${date}T${time.replace("60", "59")}`)));
};

export const partialTimePattern = new RegExp(`^${partialTime}$`);

const durSecond = `\\d+S`;
const durMinute = `\\d+M(?:${durSecond})?`;
const durHour = `\\d+H(?:${durMinute})?`;
const durTime = `T(?:${durHour}|${durMinute}|${durSecond})`;
const durDay = `\\d+D`;
const durWeek = `\\d+W`;
const durMonth = `\\d+M(?:${durDay})?`;
const durYear = `\\d+Y(?:${durMonth})?`;
const durDate = `(?:${durDay}|${durMonth}|${durYear})(?:${durTime})?`;
const duration = `P(?:${durDate}|${durTime}|${durWeek})`;

/**
 * The 'duration' format. Validates that a string represents a duration
 * according to [RFC 3339, Appendix A](https://www.rfc-editor.org/rfc/rfc3339.html#appendix-A).
 *
 * @see [JSON Schema Core, section 7.3.1](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.1)
 *
 * @function
 */
export const isDuration = RegExp.prototype.test.bind(new RegExp(`^${duration}$`));
