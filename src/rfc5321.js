import { abnf } from "@hyperjump/abnf";
import { FormatError, charAt, invalidCharacter, isProblem, matchEnd, missing, nest, sticky } from "./diagnose.js";
import { diagnoseLabels } from "./rfc1123.js";
import { diagnoseIPv4, ipv4Rules } from "./rfc2673.js";
import { diagnoseIPv6, ipv6Rules } from "./rfc4291.js";

/**
 * @import * as API from "./index.d.ts"
 * @import { Problem } from "./diagnose.js"
 */

// RFC 5321, section 4.1.2 and 4.1.3, with atext from RFC 5322. The address
// literals use the IP address rules from RFC 3986.
export const mailboxRules = `
  Mailbox                 = Local-part "@" ( Domain / address-literal )
  Local-part              = Dot-string / Quoted-string
                            ; MAY be case-sensitive
  Dot-string              = Atom *("."  Atom)
  Atom                    = 1*atext
  Quoted-string           = DQUOTE *QcontentSMTP DQUOTE
  QcontentSMTP            = qtextSMTP / quoted-pairSMTP
  quoted-pairSMTP         = %d92 %d32-126
                            ; i.e., backslash followed by any ASCII
                            ; graphic (including itself) or SPace
  qtextSMTP               = %d32-33 / %d35-91 / %d93-126
                            ; i.e., within a quoted string, any
                            ; ASCII graphic or space is permitted
                            ; without blackslash-quoting except
                            ; double-quote and the backslash itself.

  Domain                  = sub-domain *("." sub-domain)
  sub-domain              = Let-dig [Ldh-str]
  Let-dig                 = ALPHA / DIGIT
  Ldh-str                 = *( ALPHA / DIGIT / "-" ) Let-dig

  address-literal         = "[" ( IPv4-address-literal /
                            IPv6-address-literal /
                            General-address-literal ) "]"
  IPv4-address-literal    = IPv4address
  IPv6-address-literal    = "IPv6:" IPv6address
  General-address-literal = Standardized-tag ":" 1*dcontent
  Standardized-tag        = Ldh-str
                            ; Standardized-tag MUST be specified in a
                            ; Standards-Track RFC and registered with IANA
  dcontent                = %d33-90 / ; Printable US-ASCII
                            %d94-126  ; excl. "[", "\\", "]"

  atext                   = ALPHA / DIGIT /    ; Printable US-ASCII
                            "!" / "#" /        ;  characters not including
                            "$" / "%" /        ;  specials.  Used for atoms.
                            "&" / "'" /
                            "*" / "+" /
                            "-" / "/" /
                            "=" / "?" /
                            "^" / "_" /
                            "\`" / "{" /
                            "|" / "}" /
                            "~"

  ${ipv4Rules}
  ${ipv6Rules}
`;

const mailboxPattern = abnf()`Mailbox ${mailboxRules}`;
const knownAddressLiteralPattern = abnf()`IPv4-address-literal / IPv6-address-literal ${mailboxRules}`;

/**
 * Whether the address literal that a mailbox ends with, like `[IPv6:::1]`, is an IPv6 address if its tag says it is.
 * "IPv6" is a known tag, so a literal with it that isn't an IPv6 address isn't valid, though it matches
 * General-address-literal.
 *
 * @type (email: string) => boolean
 */
export const isIPv6LiteralIfTagged = (email) => {
  const addressLiteral = email.substring(email.lastIndexOf("[") + 1, email.length - 1);
  return !/^ipv6:/iu.test(addressLiteral) || knownAddressLiteralPattern.test(addressLiteral);
};

/** @type API.isEmail */
export const isEmail = (email) => {
  if (!mailboxPattern.test(email)) {
    return false;
  }

  // A domain can't end with "]", and an address literal can't have a "[".
  if (email.endsWith("]")) {
    if (!isIPv6LiteralIfTagged(email)) {
      return false;
    }

    const addressLiteral = email.substring(email.lastIndexOf("[") + 1, email.length - 1);
    if (!knownAddressLiteralPattern.test(addressLiteral)) {
      const tag = addressLiteral.substring(0, addressLiteral.indexOf(":"));
      throw Error(`Encountered unknown Address Literal Tag: ${tag}`);
    }
  }

  return true;
};

/** @type API.assertEmail */
export const assertEmail = (email) => {
  if (!isEmail(email)) {
    throw new InvalidEmailError(email, diagnoseMailbox(email, emailGrammar));
  }
};

/**
 * A value isn't an email address. {@link assertEmail} throws it.
 *
 * @hideconstructor
 */
export class InvalidEmailError extends FormatError {
  /**
   * @param {string} value
   * @param {Problem | undefined} problem
   */
  constructor(value, problem) {
    super("email", value, problem);
    this.name = "InvalidEmailError";
  }
}

// Diagnosing

/**
 * The patterns a mailbox is diagnosed with, so that RFC 6531's can be diagnosed the same way.
 *
 * @typedef {{
 *   dotString: RegExp;
 *   quotedContent: RegExp;
 *   labelChars: RegExp;
 *   addressLiteral: RegExp;
 *   hint: (char: string) => string | undefined;
 * }} MailboxGrammar
 */

/** @type (rules: string, hint: MailboxGrammar["hint"]) => MailboxGrammar */
export const mailboxGrammar = (rules, hint) => {
  const tag = abnf({ rules, anchored: false });
  return {
    dotString: sticky(tag`Dot-string`),
    quotedContent: sticky(tag`*QcontentSMTP`),
    labelChars: sticky(tag`*( Let-dig / "-" )`),
    addressLiteral: abnf({ rules })`address-literal`,
    hint
  };
};

const ldhStr = sticky(abnf({ anchored: false })`*( ALPHA / DIGIT / "-" )`);
const dcontent = sticky(abnf({ rules: mailboxRules, anchored: false })`*dcontent`);

/** @type MailboxGrammar */
const emailGrammar = mailboxGrammar(mailboxRules, (char) => {
  return /** @type number */ (char.codePointAt(0)) > 0x7F ? "it's allowed in an idn-email" : undefined;
});

/** @type (email: string, problem: Problem | undefined, grammar: MailboxGrammar) => Problem | undefined */
const withHint = (email, problem, grammar) => {
  return problem?.reason === "invalid-character" && problem.hint === undefined
    ? { ...problem, hint: grammar.hint(charAt(email, problem.start)) }
    : problem;
};

/**
 * What's wrong with a mailbox: the local part, then the "@", then the domain.
 *
 * @type (email: string, grammar: MailboxGrammar) => Problem | undefined
 */
export const diagnoseMailbox = (email, grammar) => {
  const localEnd = diagnoseLocalPart(email, grammar);
  if (isProblem(localEnd)) {
    return withHint(email, localEnd, grammar);
  }

  if (email[localEnd] !== "@") {
    return localEnd === email.length
      ? missing("domain", localEnd, `it has no "@"`)
      : withHint(email, invalidCharacter(email, localEnd, "local part", "after the local part", `it must be "@"`), grammar);
  }

  return withHint(email, diagnoseDomain(email, localEnd + 1, grammar), grammar);
};

/** @type (email: string, grammar: MailboxGrammar) => number | Problem */
const diagnoseLocalPart = (email, grammar) => {
  if (email[0] === "\"") {
    const contentEnd = matchEnd(grammar.quotedContent, email, 1);
    if (email[contentEnd] === "\"") {
      return contentEnd + 1;
    } else if (contentEnd === email.length || (email[contentEnd] === "\\" && contentEnd + 1 === email.length)) {
      return missing("local part", email.length, `it has no closing '"'`);
    } else if (email[contentEnd] === "\\") {
      return invalidCharacter(email, contentEnd + 1, "local part", `after "\\"`);
    } else {
      return invalidCharacter(email, contentEnd, "local part", "in a quoted string");
    }
  }

  const dotStringEnd = matchEnd(grammar.dotString, email, 0);
  const char = email[dotStringEnd];
  if (dotStringEnd === 0 && (char === "@" || char === undefined)) {
    return missing("local part", 0);
  } else if (char !== ".") {
    return char === "@" || char === undefined ? dotStringEnd : invalidCharacter(email, dotStringEnd, "local part");
  } else if (dotStringEnd === 0) {
    return invalidCharacter(email, 0, "local part", "at the start of the local part");
  } else if (email[dotStringEnd + 1] === ".") {
    return invalidCharacter(email, dotStringEnd + 1, "local part", `after "."`);
  } else if (email[dotStringEnd + 1] === "@" || dotStringEnd + 1 === email.length) {
    return invalidCharacter(email, dotStringEnd, "local part", "at the end of the local part");
  } else {
    return invalidCharacter(email, dotStringEnd + 1, "local part");
  }
};

/** @type (email: string, start: number, grammar: MailboxGrammar) => Problem | undefined */
const diagnoseDomain = (email, start, grammar) => {
  if (email[start] !== "[") {
    return diagnoseLabels(email, start, email.length, "domain", grammar.labelChars);
  }

  const close = email.indexOf("]", start);
  if (close === -1) {
    return missing("domain", email.length, `it has no "]"`);
  } else if (close + 1 < email.length) {
    return invalidCharacter(email, close + 1, "domain", `after "]"`);
  }

  // "IPv6" is a known tag, so its literal has to be an IPv6 address, though it matches General-address-literal
  const literal = email.slice(start + 1, close);
  if (/^ipv6:/iu.test(literal)) {
    const ipv6 = diagnoseIPv6(literal.slice(5));
    return ipv6 && nest(ipv6, start + 6, "domain");
  } else if (grammar.addressLiteral.test(email.slice(start))) {
    return undefined;
  }

  const colon = literal.indexOf(":");
  if (colon === -1) {
    const ipv4 = diagnoseIPv4(literal);
    return ipv4 && nest(ipv4, start + 1, "domain");
  }

  // A General-address-literal: a tag, ":", and the address
  const tagEnd = matchEnd(ldhStr, email, start + 1);
  if (tagEnd === start + 1) {
    return tagEnd === start + 1 + colon
      ? missing("domain", tagEnd, `it has no tag before ":"`)
      : invalidCharacter(email, tagEnd, "domain", "in an address literal's tag");
  } else if (tagEnd < start + 1 + colon) {
    return invalidCharacter(email, tagEnd, "domain", "in an address literal's tag");
  } else if (email[tagEnd - 1] === "-") {
    return invalidCharacter(email, tagEnd - 1, "domain", "at the end of an address literal's tag");
  }

  const contentEnd = matchEnd(dcontent, email, tagEnd + 1);
  return contentEnd === tagEnd + 1 && contentEnd === close
    ? missing("domain", contentEnd, `it has no address after ":"`)
    : invalidCharacter(email, contentEnd, "domain", "in an address literal");
};
