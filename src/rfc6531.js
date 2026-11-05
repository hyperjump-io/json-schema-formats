import { FormatError, nest } from "./diagnose.js";
import { idnAddressLiteral, idnDotString, idnLabelChars, idnMailbox, idnQuotedContent } from "./patterns.js";
import { diagnoseMailbox, isIPv6LiteralIfTagged } from "./rfc5321.js";
import { diagnoseIdn, isIdn } from "./uts46.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

/** @type API.isIdnEmail */
export const isIdnEmail = (email) => {
  // A domain can't end with "]" or have an "@".
  return idnMailbox.test(email)
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

/** @type import("./rfc5321.js").MailboxGrammar */
const idnEmailGrammar = {
  dotString: idnDotString,
  quotedContent: idnQuotedContent,
  labelChars: idnLabelChars,
  addressLiteral: idnAddressLiteral,
  hint: () => undefined
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
