import { abnf } from "@hyperjump/abnf";
import { FormatError, nest, sticky } from "./diagnose.js";
import { diagnoseMailbox, isIPv6LiteralIfTagged, mailboxGrammar, mailboxRules } from "./rfc5321.js";
import { diagnoseIdn, isIdn } from "./uts46.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

const idnMailboxRules = `
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

const mailboxPattern = abnf()`Mailbox ${idnMailboxRules}`;

/** @type API.isIdnEmail */
export const isIdnEmail = (email) => {
  // A domain can't end with "]" or have an "@".
  return mailboxPattern.test(email)
    && (email.endsWith("]") ? isIPv6LiteralIfTagged(email) : isIdn(email.substring(email.lastIndexOf("@") + 1)));
};

/** @type API.assertIdnEmail */
export const assertIdnEmail = (email) => {
  if (!isIdnEmail(email)) {
    throw new InvalidIdnEmailError(email, diagnoseIdnEmail(email));
  }
};

/**
 * A value isn't an internationalized email address. {@link assertIdnEmail} throws it.
 *
 * @hideconstructor
 */
export class InvalidIdnEmailError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("idn-email", value, problem);
    this.name = "InvalidIdnEmailError";
  }
}

const idnEmailGrammar = {
  ...mailboxGrammar(idnMailboxRules, () => undefined),
  labelChars: sticky(abnf({ rules: idnMailboxRules, anchored: false })`*( U-let-dig / "-" )`)
};

/** @type (email: string) => Problem | undefined */
const diagnoseIdnEmail = (email) => {
  const problem = diagnoseMailbox(email, idnEmailGrammar);
  if (problem !== undefined || email.endsWith("]")) {
    return problem;
  }

  const domainStart = email.lastIndexOf("@") + 1;
  const idn = diagnoseIdn(email.substring(domainStart));
  return idn && nest(idn, domainStart, "domain");
};
