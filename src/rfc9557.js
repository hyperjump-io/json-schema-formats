import { abnf } from "@hyperjump/abnf";
import { dateTimeRules, isDateTime } from "./rfc3339.js";

/**
 * @import * as API from "./index.d.ts"
 */

const suffixPattern = abnf({ rules: dateTimeRules })`
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

/** @type API.isDateTimeExt */
export const isDateTimeExt = (dateTimeExt) => {
  const suffixStart = dateTimeExt.indexOf("[");
  if (suffixStart === -1) {
    return isDateTime(dateTimeExt);
  }

  return isDateTime(dateTimeExt.substring(0, suffixStart))
    && suffixPattern.test(dateTimeExt.substring(suffixStart));
};
