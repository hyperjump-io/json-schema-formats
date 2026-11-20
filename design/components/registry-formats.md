# Registry formats (`src/registry.js`, `src/rfc3339.js`, `src/rfc4632.js`, `src/rfc4291.js`, `src/rfc5646.js`, `src/rfc9110.js`, `src/rfc9651.js`)

A format registry lists formats that other specifications define,
beside the ones the JSON Schema validation specification defines. There
are two:

- The [JSON Schema Format Registry](https://github.com/json-schema-org/json-schema-spec/blob/main/specs/registries/format.json),
  which the JSON Schema validation specification says implementations
  should support as if it defined them. It isn't published yet. This is
  its URL in the specification.
- The [OpenAPI Format Registry](https://spec.openapis.org/registry/format/),
  the formats that OpenAPI documents use.

This package has the registries' formats that are specified exactly,
strings and numbers, so a validator can use them the way it uses JSON
Schema's. It leaves out the ones whose definitions don't say exactly
what's valid (see
[Support only what's specified](../principles/support-only-whats-specified.md)). They're
exported from the main entry, after JSON Schema's, and each has `is` and
`assert` functions, errors, and a diagnosis like every format here.

Nothing here depends on which registry a format comes from, so the code
and the documents don't divide them by registry. A format that's in
both is defined by the same specification in both. Where the registries
name different specifications for it, that's said with the format.

| Format | Registry | Module | Rule |
| --- | --- | --- | --- |
| `date-time-local` | OpenAPI | `rfc3339.js` | `full-date "T" partial-time` |
| `time-local` | OpenAPI | `rfc3339.js` | `partial-time` |
| `ipv4-cidr` | OpenAPI | `rfc4632.js` | `IPv4address "/" ipv4-prefix-length` |
| `ipv6-cidr` | OpenAPI | `rfc4291.js` | `IPv6address "/" ipv6-prefix-length` |
| `language` | OpenAPI | `rfc5646.js` | `Language-Tag` |
| `http-date` | Both | `rfc9110.js` | `HTTP-date` |
| `media-range` | Both | `rfc9110.js` | `media-range` |
| `sf-binary`, `sf-boolean`, `sf-string`, `sf-token` | Both | `rfc9651.js` | RFC 9651's rules of the same names |
| `int8`, `int16`, `int32`, `uint8`, `double-int` | Both | `registry.js` | An integer in the registry's range |
| `uint16`, `uint32` | OpenAPI | `registry.js` | An integer in the registry's range |
| `sf-integer`, `sf-decimal` | Both | `rfc9651.js` | RFC 9651's ranges and digits |

The integer formats and the local dates and times have no specification
but the OpenAPI Format Registry, which defines them. The JSON Schema
Format Registry names the OpenAPI Specification for `int8`, `int32`, and
`uint8`, and nothing for `int16` and `double-int`. The other formats are
defined by the RFCs in the table.

Rejected: a module for each registry. A format is in a module for the
specification that defines it, and a registry only lists it.

The JSON Schema Test Suite doesn't have them, so their tests are in its
format in `test-suite/tests/` (see [Files](../style/files.md)), and
`src/assert.test.js` tests their diagnoses like the others'.

## Numbers

The registries type the number formats as JSON numbers. Their functions
take a JavaScript `number`, and are like the string formats' in
everything that a span isn't needed for. The integer formats and
`double-int` are in `registry.js`, since the OpenAPI registry defines them, and
`sf-integer` and `sf-decimal` are in `rfc9651.js`, with the other
structured fields. They share `isIntegerIn` and `integerProblem`, in
`registry.js`. Their errors extend `NumberFormatError`, in `diagnose.js`,
which has no problem or span.

### The API

Each one has an `is` function and an `assert` function, like every
format here:

```typescript
isInt8(value: number): boolean
assertInt8(value: number): void
```

A format applies only to values of its type, so the caller checks the
type before calling one, as for the string formats:

```typescript
const validateInt8 = (value: unknown) =>
  typeof value !== "number" || isInt8(value);
```

`NaN` and `Infinity` can't come from JSON, but a JavaScript caller can
pass them, and they're invalid.

Rejected:

- **No `assert` functions for numbers.** Every format has both functions,
  and a number's error still says something that `false` doesn't: which
  bound it's past, or that it isn't an integer.
- **Taking `unknown`.** No other format's functions check their value's
  type.

### Errors

A number's error has `value`, which is the number, and `reason`, with no
`part`, `start`, or `end` (see [Errors](errors.md#numbers)). A span
points at something in a string. A number is one value, which the caller
already has the place of.

| Reason | When |
| --- | --- |
| `not-an-integer` | An integer format's value has a fraction, or is `NaN` or `Infinity` |
| `out-of-range` | The value is past one of the format's bounds |
| `too-precise` | An `sf-decimal` has more than 3 digits after the point |

```text
InvalidInt8Error: Invalid int8: 300 — it must be -128 to 127
InvalidInt8Error: Invalid int8: 1.5 — it isn't an integer
InvalidSfDecimalError: Invalid sf-decimal: 1.2345 — it has 4 digits after the point; an sf-decimal can have 3
```

An `sf-decimal` with more than 12 digits before the point is
`out-of-range`, since that's a value of 10^12 or more.

Rejected:

- **A span over `String(value)`.** It would point into a string that the
  caller didn't give.
- **`too-small` and `too-large`** in place of `out-of-range`. The message
  says which bound, and a caller rarely handles the two differently.

`src/assert.test.js` makes its values by changing strings, so the number
formats have their own: random integers and decimals around each bound
and across the range, the bounds and one past them, `-0`, `NaN`, and the
infinities. The
rest of the test is the same, including that every reason an error
declares comes up.

### The parsed value

The number formats are checked on the value that parsing the JSON gives,
a JavaScript number, and not on the JSON text, which a validator doesn't
have. A JSON number is parsed to the nearest double, so a value is only
as precise as a double.

Every valid value survives that. The integer formats' ranges are inside
±2^53, where every integer is a double of its own, and an `sf-decimal`
has at most 15 significant digits, which a double tells apart. A test of
a million random `sf-decimal` values found none that parsing changed.

Known limitation: a JSON text with more precision than a double has, or
too small to be one, is checked as the double it's parsed to, which can
be valid when the text isn't:

| JSON text | Parsed | Checked as |
| --- | --- | --- |
| `127.00000000000000001` | `127` | A valid `int8`, though it isn't an integer |
| `9007199254740991.4` | `9007199254740991` | A valid `double-int` |
| `0.1230000000000000001` | `0.123` | A valid `sf-decimal`, though it has 19 digits after the point |
| `1e-400` | `0` | Valid for every one of them |

A text has to have more than about 17 significant digits, or round to
zero, for this to happen, and JSON Schema's own `integer` type and
`maximum` have the same limit in a validator that parses JSON to doubles.
RFC 8259 says that numbers are interoperable within a double's
precision. A text just past a range is still out of it as a double:
`9007199254740993` is 2^53, which isn't a `double-int`.

Rejected: checking the JSON text. The functions are given values, by a
validator that parsed the JSON, and the text
isn't there to check.

### `sf-decimal`

`sf-decimal` follows RFC 9651's
ABNF, `["-"] 1*12DIGIT "." 1*3DIGIT`, so a value with more than three
digits after the point isn't valid. The registries say the same. RFC
9651's serialization rounds such a value to three digits instead of
failing, which would make `1.2345` an `sf-decimal`, but that's what an
implementation does with a value it's given, not what's valid.

An `sf-decimal`'s digits are counted in the shortest string that parses
back to the number, which is what `String` gives. `isSfDecimal` gets the
same answer without making the string: it rounds `n * 1000` to an
integer `m` and checks that `m / 1000` is `n`. Multiplying isn't exact,
since `1.005 * 1000` is `1004.9999999999999`, but below 10^12 it's within
a small fraction of the integer, so rounding finds it. Division is exact
to the nearest double, so `m / 1000` is the number that the decimal
m/1000 parses to. The two agreed on 15 million random numbers, 1.9
million of them valid, and on the bounds. The error's text still counts
the digits in `String(n)`.

Rejected:

- **Counting the digits in `String(n)`**, which `isSfDecimal` did first.
  It took 30 times as long (see [Speed](../benchmarks/speed-registry-formats.md)).

## What's not supported

These are ambiguous (see
[Support only what's specified](../principles/support-only-whats-specified.md)):

| Format | What's left open |
| --- | --- |
| `char` | It's "a single character", with no definition of a character. |
| `decimal` | The JSON Schema registry gives it "unspecified precision and range", and the OpenAPI registry says that the format is "used in a variety of conflicting ways and is not interoperable." |
| `float`, `double` | They're IEEE 754 single and double precision numbers. Whether a JSON number has to be exactly representable, which `0.1` isn't, or only in range isn't said. |
| `decimal128` | The OpenAPI registry prefers a string, and names `NaN`, `-INF`, and `INF`, but gives no syntax for it. A JSON number loses its digits when it's parsed, so its 34 digits can't be counted. |
| `int64`, `uint64` | The range is exact, but a string is recommended past 2^53, with no syntax for it: a sign, leading zeros, or whitespace. |
| `unixtime` | It's seconds since 1970, as a number or a string. Whether it can be negative or fractional, and what the string is, isn't said. |
| `binary` | It's "any sequence of octets", with no encoding in a JSON string. |
| `html` | It's "HTML-formatted text", with no specification, so a document, a fragment, and conforming HTML are all readings of it. |

These have nothing to check, so their functions would always be `true`:

- `password` is "a string that hints to obscure the value".
- `commonmark` is CommonMark, which says that "any sequence of characters
  is a valid CommonMark document."

These are deprecated in both registries. The OpenAPI registry says to
use JSON Schema's `contentEncoding` in OpenAPI 3.1 instead:

- `byte`, which is RFC 4648's base64.
- `base64url`, which is RFC 4648's base64url.

`binary` is deprecated in the JSON Schema registry too.

## Local dates and times

`date-time-local` and `time-local` are RFC 3339's rules without the
offset. A leap second is at 23:59:60 UTC, and without an offset a local
time can't be put in UTC, so neither allows `60`, the way `time` doesn't
(see [Dates and times](dates-and-times.md#leap-seconds)). `date-time-local`
checks the day in its month with `date-time`'s check. The diagnoses reuse
`date`'s and `time`'s steps, and a value with an offset gets the hint
that a local time has none.

## CIDR

The OpenAPI registry's `ipv4-cidr` and `ipv6-cidr` are an address that's valid
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

Rejected:

- **Checking the prefix length before the address**, with `ipv6Address`
  and `ipv6PrefixLength` on each side of the `/`. It's 8 times as fast for
  a prefix length that's out of range, since the address pattern doesn't
  backtrack through its forms for it, but a quarter slower for a valid
  value (see [Speed](../benchmarks/speed-registry-formats.md)).

## Language tags

`language` is RFC 5646's `Language-Tag`, which the OpenAPI registry names. RFC
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

The JSON Schema registry names RFC 9110 for `http-date`, and the OpenAPI
registry names RFC 7231. RFC 9110 obsoletes RFC 7231, with the same
`HTTP-date` grammar, so the grammar is RFC 9110's, in
`scripts/generate-patterns.js`. The grammar has `2DIGIT` for the hour,
the minute, and the second, with their range in a comment on
`time-of-day`, `00:00:00 - 23:59:60`. The range is written out as ABNF in
each of them (see [Follow the RFCs](../principles/follow-the-rfcs.md)).
The day is `2DIGIT` with no range, so the check for the day in its month
also rejects `00`.

An HTTP date has three forms. The pattern is the grammar, and the checks
after it read the parts from where they are in the form the value is in:
an IMF-fixdate has `,` after a 3-letter day name, an asctime-date has a
space, and an rfc850-date has a longer day name. As for `date`, the
checks read the digits by their character codes and the month by the
fewest letters that tell the names apart, without making substrings.
With substrings, the checks took four times as long, and `isHttpDate`
took over twice as long (see [Speed](../benchmarks/speed-registry-formats.md)).

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
Both registries name RFC 8941, which RFC 9651 obsoletes. RFC 9651 moves the
ABNF to an informative appendix, Appendix C, which is what
`scripts/generate-patterns.js` has.

The two differ only in `sf-binary`. RFC 9651's has `=` only as padding at
the end of the base64, and RFC 8941's allows it anywhere, so `:a=b:` isn't
valid here. RFC 9651's `sf-string` allows the same characters as RFC
8941's, written differently, and its `sf-token` and `sf-boolean` are the
same.

Rejected: RFC 8941, though the registries name it. Its `sf-binary` allows
base64 that can't be decoded, like `:a=b:`.

`sf-string`'s `\` can only escape `"` and `\`, and anything else is
`invalid-escape`, like a JSON Pointer's `~`.
