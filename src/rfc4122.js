import { abnf } from "@hyperjump/abnf";

/**
 * @import * as API from "./index.d.ts"
 */

/**
 * @type API.isUuid
 * @function
 */
export const isUuid = RegExp.prototype.test.bind(abnf()`
  UUID                   = time-low "-" time-mid "-"
                           time-high-and-version "-"
                           clock-seq-and-reserved
                           clock-seq-low "-" node
  time-low               = 4hexOctet
  time-mid               = 2hexOctet
  time-high-and-version  = 2hexOctet
  clock-seq-and-reserved = hexOctet
  clock-seq-low          = hexOctet
  node                   = 6hexOctet
  hexOctet               = HEXDIG HEXDIG
`);
