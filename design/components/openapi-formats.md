# OpenAPI formats (`src/rfc3339.js`, `src/rfc4632.js`, `src/rfc4291.js`, `src/rfc5646.js`, `src/rfc9110.js`, `src/rfc9651.js`)

The [OpenAPI Format Registry](https://spec.openapis.org/registry/format/)
lists the formats that OpenAPI documents use, JSON Schema's and others.
This package has the others that are strings with a grammar, so an
OpenAPI validator can use it the way a JSON Schema validator does. It
leaves out the ones whose definitions don't say exactly what's valid (see
[Support only what's specified](../principles/support-only-whats-specified.md)). They're
exported from the main entry, after JSON Schema's, and each has `is` and
`assert` functions, errors, and a diagnosis like every format here.

| Format | Module | Rule |
| --- | --- | --- |
| `date-time-local` | `rfc3339.js` | `full-date "T" partial-time` |
| `time-local` | `rfc3339.js` | `partial-time` |
| `ipv4-cidr` | `rfc4632.js` | `IPv4address "/" ipv4-prefix-length` |
| `ipv6-cidr` | `rfc4291.js` | `IPv6address "/" ipv6-prefix-length` |
| `language` | `rfc5646.js` | `Language-Tag` |
| `http-date` | `rfc9110.js` | `HTTP-date` |
| `media-range` | `rfc9110.js` | `media-range` |
| `sf-binary`, `sf-boolean`, `sf-string`, `sf-token` | `rfc9651.js` | RFC 9651's rules of the same names |

The JSON Schema Test Suite doesn't have them, so their tests are in its
format in `test-suite/tests/` (see [Files](../style/files.md)), and
`src/assert.test.js` tests their diagnoses like the others'.

## What's not here yet

- **Numbers**: `int8` to `uint64`, `double-int`, `float`, `double`,
  `decimal128`, `sf-integer`, `sf-decimal`, and `unixtime`.
  The registry types them as JSON numbers, some of them as numbers or
  strings. A number has no span for an error to point at, and one past
  2^53 is rounded before a validator sees it. How the API takes them is
  open.
- **Deprecated**: `byte`, `base64url`, and `binary`.
- **No syntax to check**: `password`, `commonmark`, and `html`.

Not supported, because they're ambiguous (see
[Support only what's specified](../principles/support-only-whats-specified.md)):
`char`, which is "a single character" with no definition of a character,
and `decimal`, which the registry says isn't interoperable.

## Local dates and times

`date-time-local` and `time-local` are RFC 3339's rules without the
offset. A leap second is at 23:59:60 UTC, and without an offset a local
time can't be put in UTC, so neither allows `60`, the way `time` doesn't
(see [Dates and times](dates-and-times.md#leap-seconds)). `date-time-local`
checks the day in its month with `date-time`'s check. The diagnoses reuse
`date`'s and `time`'s steps, and a value with an offset gets the hint
that a local time has none.

## CIDR

The registry's `ipv4-cidr` and `ipv6-cidr` are an address that's valid
for `ipv4` or `ipv6`, `/`, and a prefix length that's "a decimal integer"
from 0 to 32 or 128. A bare address isn't valid. RFC 4632 and RFC 4291,
which the registry cites for the notation, have no ABNF for it, so the
grammar is written from their prose, with the address rules that `ipv4`
and `ipv6` use. `ipv6-cidr` is in `rfc4291.js`, with `ipv6`, since RFC
4291 defines its notation. The diagnosis of the address is `ipv4`'s or
`ipv6`'s, and the prefix length's is `diagnoseCidr`, in `rfc4632.js`.

Neither the registry nor the RFCs settle two things, so they're
decisions:

- **The bits after the prefix can be set**, as in `10.0.0.1/8`. The
  registry's rules don't restrict them, and RFC 4291 writes
  `2001:0DB8:0:CD30:123:4567:89AB:CDEF/60` as a node address with the
  prefix of its subnet. Some tools take the notation to name a network,
  which can't have them, like Python's `ip_network`, and some don't, like
  its `ip_interface`.
- **The prefix length has no leading zeros**, like an IPv4 address's
  `dec-octet`. "A decimal integer" doesn't say, and a prefix length is
  written without them in every example.

## Language tags

`language` is RFC 5646's `Language-Tag`, which the registry names. RFC
5646 calls a tag that matches it "well-formed", and a tag "valid" if it
also has subtags from the IANA Language Subtag Registry and no repeated
variant or singleton. The registry points at the rule, so `language` is
well-formed: checking that it's valid would need the IANA registry's data
in the package. The function is `isLanguageTag`, since `isLanguage`
wouldn't say what it checks.

The ABNF matches in any case, as RFC 5646 says tags are compared, and
the grandfathered tags are in it. The diagnosis reads one subtag at a
time. A subtag's kind follows from its length and its characters, like 4
letters for a script, and the kinds come in a fixed order, so each
subtag is either the next kind that fits or out of place. A subtag out of
place gets a hint that lists what can come there.

## HTTP dates

The registry names RFC 7231 for `http-date`. RFC 9110 obsoletes it, with
the same `HTTP-date` grammar, so the grammar is RFC 9110's, in
`scripts/generate-patterns.js`. The grammar has `2DIGIT` for the hour,
the minute, and the second, with their range in a comment on
`time-of-day`, `00:00:00 - 23:59:60`. The range is written out as ABNF in
each of them (see [Follow the RFCs](../principles/follow-the-rfcs.md)).
The day is `2DIGIT` with no range, so the check for the day in its month
also rejects `00`.

An HTTP date has three forms. The pattern is the grammar, and the checks
after it read the parts from where they are in the form the value is in:
an IMF-fixdate has `,` after a 3-letter day name, an asctime-date has a
space, and an rfc850-date has a longer day name.

The checks after the pattern:

- **The day is in its month**, as for `date`. It's `nonexistent-date`.
- **The day name is the date's.** RFC 9110 says that the parts of a date
  mean what they do in RFC 5322, and RFC 5322 says that a day of the week
  has to be the date's. `date-math.js` has `dayOfWeek`, which computes it
  from the date, because `Date` takes years 0 to 99 to be 1900 to 1999. It's
  `wrong-day-name`, a reason of its own: the day exists, and either the
  name or the date is wrong.
- **A second of 60 is a leap second**, as for `date-time`, in GMT. It's
  `nonexistent-leap-second`.

The names are case-sensitive, since the grammar has them as `%s"..."`,
and the diagnosis hints so for a name in another case.

### The rfc850-date's century

An rfc850-date's year has two digits. RFC 9110 says that a recipient
takes it to be within 50 years of now, which would make the answer
depend on a clock: a validator would give a different answer for the
same value from one year to the next. So the checks use only what's known
without the century:

- February 29 needs the year to be a leap year in some century. That's
  `daysInMonth` of the two digits as a year, since `00` is a leap year
  like 2000 is.
- A leap second has to be at 23:59:60, which every leap second is.
- The day name isn't checked. It's a different day in each century.

These accept some values that are wrong in the century the RFC means,
but never reject one that's right in it. That's an exception to
[Answer only what's known](../principles/answer-only-whats-known.md),
which would throw for an rfc850-date, since its day name can't be
checked. HTTP still requires recipients to accept the form, so throwing
would make a value that HTTP accepts an error.

## Media ranges

`media-range` is RFC 9110's, with the rules it uses from other sections
of RFC 9110 copied in: `token`, `parameters`, `OWS`, and `quoted-string`.
`obs-text` is `%x80-FF`, which is octets in HTTP, and is code points
U+0080 to U+00FF in a JavaScript string, so `é` is allowed in a quoted
string and `ā` isn't. The diagnosis walks the type, the subtype, and each
parameter, and a parameter's quoted string has its own loop for its
escapes.

## Structured fields

`sf-binary`, `sf-boolean`, `sf-string`, and `sf-token` are RFC 9651's.
The registry names RFC 8941, which RFC 9651 obsoletes. RFC 9651 moves the
ABNF to an informative appendix, Appendix C, which is what
`scripts/generate-patterns.js` has.

The two differ only in `sf-binary`. RFC 9651's has `=` only as padding at
the end of the base64, and RFC 8941's allows it anywhere, so `:a=b:` isn't
valid here. RFC 9651's `sf-string` allows the same characters as RFC
8941's, written differently, and its `sf-token` and `sf-boolean` are the
same.

Rejected: RFC 8941, though the registry names it. Its `sf-binary` allows
base64 that can't be decoded, like `:a=b:`.

`sf-string`'s `\` can only escape `"` and `\`, and anything else is
`invalid-escape`, like a JSON Pointer's `~`.
