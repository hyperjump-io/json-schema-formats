// Generates src/patterns.js, every format's patterns, from their RFCs' ABNF. Run `npm run generate` after changing
// them. src/patterns.test.js fails when src/patterns.js isn't what this generates.
//
// Compiling ABNF takes time, so it's done here instead of when the library loads, and @hyperjump/abnf is only a
// development dependency.
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { abnf } from "@hyperjump/abnf";

// RFC 3339, section 5.6. The ranges in the comments are written out as ABNF.
const dateTimeRules = `
  date-fullyear   = 4DIGIT
  date-month      = "0" %x31-39 / "1" %x30-32 ; 01-12
  date-mday       = "0" %x31-39 / %x31-32 DIGIT / "3" %x30-31
                    ; 01-28, 01-29, 01-30, 01-31 based on
                    ; month/year
  time-hour       = %x30-31 DIGIT / "2" %x30-33 ; 00-23
  time-minute     = %x30-35 DIGIT ; 00-59
  time-second     = %x30-35 DIGIT / "60" ; 00-58, 00-59, 00-60 based on leap second
                    ; rules
  time-secfrac    = "." 1*DIGIT
  time-numoffset  = ("+" / "-") time-hour ":" time-minute
  time-offset     = "Z" / time-numoffset

  partial-time    = time-hour ":" time-minute ":" time-second
                    [time-secfrac]
  full-date       = date-fullyear "-" date-month "-" date-mday
  full-time       = partial-time time-offset

  date-time       = full-date "T" full-time
`;

const durationRules = `
  ; RFC 3339, appendix A, with the designators in upper case only
  duration   = %s"P" (dur-date / dur-time / dur-week)

  dur-second = 1*DIGIT %s"S"
  dur-minute = 1*DIGIT %s"M" [dur-second]
  dur-hour   = 1*DIGIT %s"H" [dur-minute]
  dur-time   = %s"T" (dur-hour / dur-minute / dur-second)
  dur-day    = 1*DIGIT %s"D"
  dur-week   = 1*DIGIT %s"W"
  dur-month  = 1*DIGIT %s"M" [dur-day]
  dur-year   = 1*DIGIT %s"Y" [dur-month]
  dur-date   = (dur-day / dur-month / dur-year) [dur-time]
`;

// RFC 9557, section 4.1
const suffixRules = `
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

// RFC 1123, section 2.1
const hostnameRules = `
  hostname    = label *( "." label )
  label       = let-dig [ *61let-dig-hyp let-dig ] ; 1-63 characters
  let-dig     = ALPHA / DIGIT
  let-dig-hyp = let-dig / "-"
`;

// RFC 3986, section 3.2.2
const ipv4Rules = `
  IPv4address = dec-octet "." dec-octet "." dec-octet "." dec-octet

  dec-octet   = DIGIT                 ; 0-9
              / %x31-39 DIGIT         ; 10-99
              / "1" 2DIGIT            ; 100-199
              / "2" %x30-34 DIGIT     ; 200-249
              / "25" %x30-35          ; 250-255
`;

// RFC 3986, section 3.2.2. It references IPv4address from ipv4Rules.
const ipv6Rules = `
  IPv6address =                            6( h16 ":" ) ls32
              /                       "::" 5( h16 ":" ) ls32
              / [               h16 ] "::" 4( h16 ":" ) ls32
              / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
              / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
              / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
              / [ *4( h16 ":" ) h16 ] "::"              ls32
              / [ *5( h16 ":" ) h16 ] "::"              h16
              / [ *6( h16 ":" ) h16 ] "::"

  h16         = 1*4HEXDIG
  ls32        = ( h16 ":" h16 ) / IPv4address
`;

// RFC 5321, section 4.1.2 and 4.1.3, with atext from RFC 5322. The address
// literals use the IP address rules from RFC 3986.
const mailboxRules = `
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

// RFC 4122, section 3
const uuidRules = `
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
`;

// RFC 6570, section 2
const uriTemplateRules = `
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
`;

// RFC 6901, section 3
const jsonPointerRules = `
  json-pointer    = *( "/" reference-token )
  reference-token = *( unescaped / escaped )
  unescaped       = %x00-2E / %x30-7D / %x7F-10FFFF
     ; %x2F ('/') and %x7E ('~') are excluded from 'unescaped'
  escaped         = "~" ( "0" / "1" )
    ; representing '~' and '/', respectively
`;

// draft-bhutton-relative-json-pointer-00, section 3
const relativeJsonPointerRules = `
  relative-json-pointer = non-negative-integer [index-manipulation] json-pointer
                        / non-negative-integer "#"
  index-manipulation    = ("+" / "-") non-negative-integer
  non-negative-integer  = %x30 / %x31-39 *%x30-39
  ${jsonPointerRules}
`;

// RFC 9110, section 5.6.7. The range in time-of-day's comment is written out
// as ABNF in hour, minute, and second.
const httpDateRules = `
  HTTP-date    = IMF-fixdate / obs-date

  IMF-fixdate  = day-name "," SP date1 SP time-of-day SP GMT
  ; fixed length/zone/capitalization subset of the format
  ; see Section 3.3 of [RFC5322]

  day-name     = %s"Mon" / %s"Tue" / %s"Wed"
               / %s"Thu" / %s"Fri" / %s"Sat" / %s"Sun"

  date1        = day SP month SP year
               ; e.g., 02 Jun 1982

  day          = 2DIGIT
  month        = %s"Jan" / %s"Feb" / %s"Mar" / %s"Apr"
               / %s"May" / %s"Jun" / %s"Jul" / %s"Aug"
               / %s"Sep" / %s"Oct" / %s"Nov" / %s"Dec"
  year         = 4DIGIT

  GMT          = %s"GMT"

  time-of-day  = hour ":" minute ":" second
               ; 00:00:00 - 23:59:60 (leap second)

  hour         = %x30-31 DIGIT / "2" %x30-33 ; 00-23
  minute       = %x30-35 DIGIT ; 00-59
  second       = %x30-35 DIGIT / "60" ; 00-59, 60 for a leap second

  obs-date     = rfc850-date / asctime-date

  rfc850-date  = day-name-l "," SP date2 SP time-of-day SP GMT
  date2        = day "-" month "-" 2DIGIT
               ; e.g., 02-Jun-82

  day-name-l   = %s"Monday" / %s"Tuesday" / %s"Wednesday"
               / %s"Thursday" / %s"Friday" / %s"Saturday"
               / %s"Sunday"

  asctime-date = day-name SP date3 SP time-of-day SP year
  date3        = month SP ( 2DIGIT / ( SP 1DIGIT ))
               ; e.g., Jun  2
`;

// RFC 9110, section 5.6.2
const tokenRules = `
  token          = 1*tchar

  tchar          = "!" / "#" / "$" / "%" / "&" / "'" / "*"
                 / "+" / "-" / "." / "^" / "_" / "\`" / "|" / "~"
                 / DIGIT / ALPHA
                 ; any VCHAR, except delimiters
`;

// RFC 9110, section 12.5.1, with the rules it uses: type and subtype from
// section 8.3.1, parameters from section 5.6.6, OWS from section 5.6.3,
// quoted-string from section 5.6.4, and obs-text from section 5.5.
const mediaRangeRules = `
  media-range    = ( "*/*"
                     / ( type "/" "*" )
                     / ( type "/" subtype )
                   ) parameters

  type       = token
  subtype    = token

  parameters      = *( OWS ";" OWS [ parameter ] )
  parameter       = parameter-name "=" parameter-value
  parameter-name  = token
  parameter-value = ( token / quoted-string )

  OWS            = *( SP / HTAB )
                 ; optional whitespace

  quoted-string  = DQUOTE *( qdtext / quoted-pair ) DQUOTE
  qdtext         = HTAB / SP / %x21 / %x23-5B / %x5D-7E / obs-text
  quoted-pair    = "\\" ( HTAB / SP / VCHAR / obs-text )

  obs-text       = %x80-FF

  ${tokenRules}
`;

// RFC 9651, appendix C, which is informative, for what sections 3.3.3 to
// 3.3.6 say. tchar is from RFC 9110.
const structuredFieldRules = `
  sf-string        = DQUOTE *( unescaped / "%" / bs-escaped ) DQUOTE
  sf-token         = ( ALPHA / "*" ) *( tchar / ":" / "/" )
  sf-binary        = ":" base64 ":"
  sf-boolean       = "?" ( "0" / "1" )

  unescaped    = %x20-21 / %x23-24 / %x26-5B / %x5D-7E
  bs-escaped   = "\\" ( DQUOTE / "\\" )
  base64       = *( ALPHA / DIGIT / "+" / "/" ) *"="

  ${tokenRules}
`;

// Without a date, a leap second can't be valid.
const timeSecondWithoutLeapSecond = `%x30-35 DIGIT`;

const dateTime = abnf({ rules: dateTimeRules });
const fragment = abnf({ anchored: false });
const httpDate = abnf({ rules: httpDateRules });

/**
 * A pattern for diagnosing, which matches as much as it can where a diagnosis puts its `lastIndex`.
 *
 * @type (pattern: RegExp) => RegExp
 */
const sticky = (pattern) => new RegExp(pattern.source, "uy");

/** @type [name: string, comment: string, pattern: RegExp][] */
const patterns = [
  // Diagnosing, shared
  ["digits", "*DIGIT", sticky(fragment`*DIGIT`)],
  ["hexdigs", "*HEXDIG", sticky(fragment`*HEXDIG`)],
  ["letDigHyps", `*( ALPHA / DIGIT / "-" ), the characters of a hostname's or a domain's label, and of an address
literal's tag`, sticky(fragment`*( ALPHA / DIGIT / "-" )`)],

  // RFC 3339
  ["fullDate", "RFC 3339 full-date", dateTime`full-date`],
  ["time", "RFC 3339 full-time, without leap seconds", dateTime`
    time-hour ":" time-minute ":" time-second [time-secfrac] time-offset
    time-second = ${timeSecondWithoutLeapSecond}
  `],
  ["dateTime", "RFC 3339 date-time", dateTime`date-time`],
  ["duration", "RFC 3339 duration", abnf()`duration ${durationRules}`],
  ["dateFullyear", "RFC 3339 date-fullyear", dateTime`date-fullyear`],
  ["dateMonth", "RFC 3339 date-month", dateTime`date-month`],
  ["dateMday", "RFC 3339 date-mday", dateTime`date-mday`],
  ["timeHour", "RFC 3339 time-hour", dateTime`time-hour`],
  ["timeMinute", "RFC 3339 time-minute", dateTime`time-minute`],
  ["timeSecond", "RFC 3339 time-second", dateTime`time-second`],
  ["timeSecondWithoutLeapSecond", "RFC 3339 time-second, without leap seconds", dateTime`${timeSecondWithoutLeapSecond}`],
  ["timeLocal", "RFC 3339 partial-time, without leap seconds", dateTime`
    time-hour ":" time-minute ":" time-second [time-secfrac]
    time-second = ${timeSecondWithoutLeapSecond}
  `],
  ["dateTimeLocal", "RFC 3339 full-date \"T\" partial-time, without leap seconds", dateTime`
    full-date "T" time-hour ":" time-minute ":" time-second [time-secfrac]
    time-second = ${timeSecondWithoutLeapSecond}
  `],

  // RFC 9557
  ["dateTimeExt", "RFC 9557 date-time-ext", abnf({ rules: dateTimeRules })`date-time suffix ${suffixRules}`],
  ["timeZoneInitial", "RFC 9557 time-zone-initial", sticky(abnf({ rules: suffixRules, anchored: false })`time-zone-initial`)],
  ["timeZoneChars", "RFC 9557 *time-zone-char", sticky(abnf({ rules: suffixRules, anchored: false })`*time-zone-char`)],
  ["suffixKey", "RFC 9557 suffix-key", sticky(abnf({ rules: suffixRules, anchored: false })`suffix-key`)],
  ["suffixValues", "RFC 9557 suffix-values", sticky(abnf({ rules: suffixRules, anchored: false })`suffix-values`)],

  // RFC 1123
  ["hostname", "RFC 1123 hostname", abnf()`hostname ${hostnameRules}`],

  // RFC 2673 and RFC 4291
  ["ipv4Address", "RFC 3986 IPv4address", abnf()`IPv4address ${ipv4Rules}`],
  ["decOctet", "RFC 3986 dec-octet", abnf()`dec-octet ${ipv4Rules}`],
  ["ipv6Address", "RFC 3986 IPv6address", abnf()`IPv6address ${ipv6Rules} ${ipv4Rules}`],

  // RFC 5321
  ["mailbox", "RFC 5321 Mailbox", abnf()`Mailbox ${mailboxRules}`],
  ["knownAddressLiteral", "RFC 5321 IPv4-address-literal / IPv6-address-literal", abnf()`IPv4-address-literal / IPv6-address-literal ${mailboxRules}`],
  ["addressLiteral", "RFC 5321 address-literal", abnf({ rules: mailboxRules })`address-literal`],
  ["dotString", "RFC 5321 Dot-string", sticky(abnf({ rules: mailboxRules, anchored: false })`Dot-string`)],
  ["quotedContent", "RFC 5321 *QcontentSMTP", sticky(abnf({ rules: mailboxRules, anchored: false })`*QcontentSMTP`)],
  ["dcontents", "RFC 5321 *dcontent", sticky(abnf({ rules: mailboxRules, anchored: false })`*dcontent`)],

  // RFC 6531
  ["idnMailbox", "RFC 6531 Mailbox", abnf()`Mailbox ${idnMailboxRules}`],
  ["idnAddressLiteral", "RFC 6531 address-literal", abnf({ rules: idnMailboxRules })`address-literal`],
  ["idnDotString", "RFC 6531 Dot-string", sticky(abnf({ rules: idnMailboxRules, anchored: false })`Dot-string`)],
  ["idnQuotedContent", "RFC 6531 *QcontentSMTP", sticky(abnf({ rules: idnMailboxRules, anchored: false })`*QcontentSMTP`)],
  ["idnLabelChars", `*( U-let-dig / "-" ), the characters of an RFC 6531 sub-domain`, sticky(abnf({ rules: idnMailboxRules, anchored: false })`*( U-let-dig / "-" )`)],

  // RFC 4122
  ["uuid", "RFC 4122 UUID", abnf()`UUID ${uuidRules}`],
  ["timeLow", "RFC 4122 time-low", abnf({ rules: uuidRules })`time-low`],
  ["timeMid", "RFC 4122 time-mid", abnf({ rules: uuidRules })`time-mid`],
  ["timeHighAndVersion", "RFC 4122 time-high-and-version", abnf({ rules: uuidRules })`time-high-and-version`],
  ["clockSeq", "RFC 4122 clock-seq-and-reserved clock-seq-low", abnf({ rules: uuidRules })`clock-seq-and-reserved clock-seq-low`],
  ["node", "RFC 4122 node", abnf({ rules: uuidRules })`node`],

  // RFC 6570
  ["uriTemplate", "RFC 6570 URI-Template", abnf()`URI-Template ${uriTemplateRules}`],
  ["literalChars", `RFC 6570 *literals, without pct-encoded`, sticky(abnf({ rules: uriTemplateRules, anchored: false })`*( literals ) pct-encoded = "%"`)],
  ["operator", "RFC 6570 operator", sticky(abnf({ rules: uriTemplateRules, anchored: false })`operator`)],
  ["varchars", `*( ALPHA / DIGIT / "_" ), RFC 6570 varchar without pct-encoded`, sticky(fragment`*( ALPHA / DIGIT / "_" )`)],
  ["maxLength", "RFC 6570 max-length", abnf({ rules: uriTemplateRules })`max-length`],

  // RFC 6901 and draft-bhutton-relative-json-pointer-00
  ["jsonPointer", "RFC 6901 json-pointer", abnf()`json-pointer ${jsonPointerRules}`],
  ["relativeJsonPointer", "draft-bhutton-relative-json-pointer-00 relative-json-pointer", abnf()`relative-json-pointer ${relativeJsonPointerRules}`],

  // RFC 9110
  ["httpDate", "RFC 9110 HTTP-date", abnf()`HTTP-date ${httpDateRules}`],
  ["httpDayName", "RFC 9110 day-name", httpDate`day-name`],
  ["httpDayNameL", "RFC 9110 day-name-l", httpDate`day-name-l`],
  ["httpDay", "RFC 9110 day", httpDate`day`],
  ["httpOneDigitDay", "RFC 9110 1DIGIT, the day of a date3 after SP", httpDate`1DIGIT`],
  ["httpMonth", "RFC 9110 month", httpDate`month`],
  ["httpYear", "RFC 9110 year", httpDate`year`],
  ["httpTwoDigitYear", "RFC 9110 2DIGIT, the year of a date2", httpDate`2DIGIT`],
  ["httpHour", "RFC 9110 hour", httpDate`hour`],
  ["httpMinute", "RFC 9110 minute", httpDate`minute`],
  ["httpSecond", "RFC 9110 second", httpDate`second`],
  ["alphas", "*ALPHA", sticky(fragment`*ALPHA`)],
  ["mediaRange", "RFC 9110 media-range", abnf()`media-range ${mediaRangeRules}`],
  ["tchars", "RFC 9110 *tchar", sticky(abnf({ rules: tokenRules, anchored: false })`*tchar`)],
  ["quotedStringChars", "RFC 9110 *qdtext", sticky(abnf({ rules: mediaRangeRules, anchored: false })`*qdtext`)],
  ["quotedPairChar", "RFC 9110 HTAB / SP / VCHAR / obs-text, what follows the \\ of a quoted-pair", abnf({ rules: mediaRangeRules })`HTAB / SP / VCHAR / obs-text`],

  // RFC 9651
  ["sfString", "RFC 9651 sf-string", abnf()`sf-string ${structuredFieldRules}`],
  ["sfToken", "RFC 9651 sf-token", abnf()`sf-token ${structuredFieldRules}`],
  ["sfBinary", "RFC 9651 sf-binary", abnf()`sf-binary ${structuredFieldRules}`],
  ["sfBoolean", "RFC 9651 sf-boolean", abnf()`sf-boolean ${structuredFieldRules}`],
  ["sfUnescapedChars", `RFC 9651 *( unescaped / "%" )`, sticky(abnf({ rules: structuredFieldRules, anchored: false })`*( unescaped / "%" )`)],
  ["sfTokenChars", `RFC 9651 *( tchar / ":" / "/" ), what follows an sf-token's first character`, sticky(abnf({ rules: structuredFieldRules, anchored: false })`*( tchar / ":" / "/" )`)],
  ["base64Chars", `RFC 9651 *( ALPHA / DIGIT / "+" / "/" ), the characters of base64 before its padding`, sticky(abnf({ rules: structuredFieldRules, anchored: false })`*( ALPHA / DIGIT / "+" / "/" )`)],
  ["base64Padding", `RFC 9651 *"=", base64's padding`, sticky(abnf({ rules: structuredFieldRules, anchored: false })`*"="`)]
];

/** @type () => string */
export const generate = () => {
  let file = `// Generated by scripts/generate-patterns.js from the formats' ABNF, which is there. Don't edit it: change the
// script and run \`npm run generate\`.
`;
  for (const [name, comment, pattern] of patterns) {
    file += `\n${comment.replaceAll(/^/gm, "// ")}\nexport const ${name} = /${pattern.source}/${pattern.flags};\n`;
  }
  return file;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await writeFile(new URL("../src/patterns.js", import.meta.url), generate());
}
