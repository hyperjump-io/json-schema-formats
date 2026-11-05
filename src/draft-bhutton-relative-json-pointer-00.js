import { abnf } from "@hyperjump/abnf";
import { jsonPointerRules } from "./rfc6901.js";

/**
 * @import * as API from "./index.d.ts"
 */

/**
 * @type API.isRelativeJsonPointer
 * @function
 */
export const isRelativeJsonPointer = RegExp.prototype.test.bind(abnf()`
  relative-json-pointer = non-negative-integer [index-manipulation] json-pointer
                        / non-negative-integer "#"
  index-manipulation    = ("+" / "-") non-negative-integer
  non-negative-integer  = %x30 / %x31-39 *%x30-39
  ${jsonPointerRules}
`);
