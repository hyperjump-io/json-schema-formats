import { abnf } from "@hyperjump/abnf";

/**
 * @import * as API from "./index.d.ts"
 */

export const jsonPointerRules = `
  json-pointer    = *( "/" reference-token )
  reference-token = *( unescaped / escaped )
  unescaped       = %x00-2E / %x30-7D / %x7F-10FFFF
     ; %x2F ('/') and %x7E ('~') are excluded from 'unescaped'
  escaped         = "~" ( "0" / "1" )
    ; representing '~' and '/', respectively
`;

/**
 * @type API.isJsonPointer
 * @function
 */
export const isJsonPointer = RegExp.prototype.test.bind(abnf()`json-pointer ${jsonPointerRules}`);
