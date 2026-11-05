import { abnf } from "@hyperjump/abnf";
import { ipv4Rules } from "./rfc2673.js";
import { ipv6Rules } from "./rfc4291.js";

/**
 * @import * as API from "./index.d.ts"
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
