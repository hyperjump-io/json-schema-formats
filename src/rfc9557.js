import { isDateTime } from "./rfc3339.js";

/**
 * @import * as API from "./index.d.ts"
 */

const alpha = `[a-zA-Z]`;
const lcalpha = `[a-z]`;
const digit = `\\d`;
const alphanum = `[a-zA-Z\\d]`;
const criticalFlag = `!?`;

const timeHour = `(?:[01]\\d|2[0-3])`; // 00-23
const timeMinute = `[0-5]\\d`; // 00-59
const timeNumoffset = `[+-]${timeHour}:${timeMinute}`;

const timeZoneInitial = `(?:${alpha}|[._])`;
const timeZoneChar = `(?:${timeZoneInitial}|${digit}|[+-])`;
const timeZonePart = `(?!\\.\\.?[/\\]])${timeZoneInitial}${timeZoneChar}{0,13}`; // but not "." or ".."
const timeZoneName = `${timeZonePart}(?:/${timeZonePart})*`;
const timeZone = `\\[${criticalFlag}(?:${timeZoneName}|${timeNumoffset})\\]`;

const keyInitial = `(?:${lcalpha}|_)`;
const keyChar = `(?:${keyInitial}|${digit}|-)`;
const suffixKey = `${keyInitial}${keyChar}*`;
const suffixValue = `${alphanum}+`;
const suffixValues = `${suffixValue}(?:-${suffixValue})*`;
const suffixTag = `\\[${criticalFlag}${suffixKey}=${suffixValues}\\]`;

const suffix = `(?:${timeZone})?(?:${suffixTag})*`;

const suffixPattern = new RegExp(`^${suffix}$`);

/** @type API.isDateTimeExt */
export const isDateTimeExt = (dateTimeExt) => {
  const suffixStart = dateTimeExt.indexOf("[");
  if (suffixStart === -1) {
    return isDateTime(dateTimeExt);
  }

  return isDateTime(dateTimeExt.substring(0, suffixStart))
    && suffixPattern.test(dateTimeExt.substring(suffixStart));
};
