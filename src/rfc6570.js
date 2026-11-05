import { abnf } from "@hyperjump/abnf";

/**
 * @import * as API from "./index.d.ts"
 */

/**
 * @type API.isUriTemplate
 * @function
 */
export const isUriTemplate = RegExp.prototype.test.bind(abnf()`
  URI-Template    = *( literals / expression )

  literals        = %x21 / %x23-24 / %x26-3B / %x3D / %x3F-5B
                  / %x5D / %x5F / %x61-7A / %x7E / ucschar / iprivate
                  / pct-encoded
                       ; any Unicode character except: CTL, SP,
                       ;  DQUOTE, "%" (aside from pct-encoded),
                       ;  "<", ">", "\\", "^", "\`", "{", "|", "}"

  expression      = "{" [ operator ] variable-list "}"
  operator        = op-level2 / op-level3 / op-reserve
  op-level2       = "+" / "#"
  op-level3       = "." / "/" / ";" / "?" / "&"
  op-reserve      = "=" / "," / "!" / "@" / "|"

  variable-list   = varspec *( "," varspec )
  varspec         = varname [ modifier-level4 ]
  varname         = varchar *( ["."] varchar )
  varchar         = ALPHA / DIGIT / "_" / pct-encoded

  modifier-level4 = prefix / explode
  prefix          = ":" max-length
  max-length      = %x31-39 0*3DIGIT ; positive integer < 10000
  explode         = "*"

  pct-encoded     = "%" HEXDIG HEXDIG

  ucschar         = %xA0-D7FF / %xF900-FDCF / %xFDF0-FFEF
                  / %x10000-1FFFD / %x20000-2FFFD / %x30000-3FFFD
                  / %x40000-4FFFD / %x50000-5FFFD / %x60000-6FFFD
                  / %x70000-7FFFD / %x80000-8FFFD / %x90000-9FFFD
                  / %xA0000-AFFFD / %xB0000-BFFFD / %xC0000-CFFFD
                  / %xD0000-DFFFD / %xE1000-EFFFD
  iprivate        = %xE000-F8FF / %xF0000-FFFFD / %x100000-10FFFD
`);
