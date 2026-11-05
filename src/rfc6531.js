import { abnf } from "@hyperjump/abnf";
import { mailboxRules } from "./rfc5321.js";
import { isIdn } from "./uts46.js";

/**
 * @import * as API from "./index.d.ts"
 */

const mailboxPattern = abnf()`
  Mailbox
  ${mailboxRules}

  ; RFC 6531, section 3.3
  sub-domain     =/ U-label
  atext          =/ UTF8-non-ascii
  qtextSMTP      =/ UTF8-non-ascii

  ; A U-label is checked with UTS #46. This matches what it can have.
  U-label        = U-let-dig [U-ldh-str]
  U-let-dig      = ALPHA / DIGIT / ucschar
  U-ldh-str      = *( U-let-dig / "-" ) U-let-dig

  UTF8-non-ascii = %x80-D7FF / %xE000-10FFFF

  ; RFC 3987, section 2.2
  ucschar        = %xA0-D7FF / %xF900-FDCF / %xFDF0-FFEF
                 / %x10000-1FFFD / %x20000-2FFFD / %x30000-3FFFD
                 / %x40000-4FFFD / %x50000-5FFFD / %x60000-6FFFD
                 / %x70000-7FFFD / %x80000-8FFFD / %x90000-9FFFD
                 / %xA0000-AFFFD / %xB0000-BFFFD / %xC0000-CFFFD
                 / %xD0000-DFFFD / %xE1000-EFFFD
`;

/** @type API.isIdnEmail */
export const isIdnEmail = (email) => {
  // A domain can't end with "]" or have an "@".
  return mailboxPattern.test(email)
    && (email.endsWith("]") || isIdn(email.substring(email.lastIndexOf("@") + 1)));
};
