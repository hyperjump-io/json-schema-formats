# Find what's wrong

*Coming soon*

Each format has an `assert` function too. It checks a value like the `is`
function does, and returns nothing if the value is valid. If it isn't, the
function throws an error that says what's wrong and where:

```typescript
import { assertEmail } from "@hyperjump/json-schema-formats";

assertEmail("ada lovelace@example.com");
```

```text
InvalidEmailError: Invalid email: ada lovelace@example.com — " " isn't allowed in the local part, at 3
```

An `is` function only runs the checks, so it stays fast. An `assert`
function runs the same checks, and works out what's wrong only when they
fail. Use the `is` function when you only need to know whether a value is
valid, like when you validate the `format` keyword. Use the `assert`
function when someone needs to see the problem, like the user of an
editor.

## Errors

Each `assert` function throws an error of its own class, so you can tell
them apart with `instanceof`. Each one extends `Error`, and has the
following properties:

| Property | Description |
| --- | --- |
| `value` | The value that isn't valid |
| `reason` | What's wrong. For more information, see [Reasons](#reasons). |
| `part` | The part of the value that's wrong, like `"month"` for a date or `"domain"` for an email address |
| `start` | Where the problem starts in `value` |
| `end` | Where the problem ends in `value`. The problem is `value.slice(start, end)`. |

For example, an error about the hour in a time has its position:

```typescript
import {
  InvalidTimeError,
  assertTime
} from "@hyperjump/json-schema-formats";

try {
  assertTime("9:30:00Z");
} catch (error) {
  if (error instanceof InvalidTimeError) {
    error.part; // "hour"
    error.value.slice(error.start, error.end); // "9"
  }
}
```

`start` and `end` are indexes in the string, like any index of a
JavaScript string. A character outside the Basic Multilingual Plane, like
most emoji, counts as two. When something is missing, `start` and `end`
are the same, at the place where it would go.

The message starts with the format and the value, and then says what's
wrong and where it starts:

```text
InvalidTimeError: Invalid time: 9:30:00Z — the hour must be 00-23, at 0
InvalidDurationError: Invalid duration: P1D2H — hours must come after "T", at 4
```

The following table shows the error that each function throws:

| Function | Error |
| --- | --- |
| `assertDate` | `InvalidDateError` |
| `assertTime` | `InvalidTimeError` |
| `assertDateTime` | `InvalidDateTimeError` |
| `assertDateTimeExt` | `InvalidDateTimeExtError` |
| `assertDuration` | `InvalidDurationError` |
| `assertEmail` | `InvalidEmailError` |
| `assertIdnEmail` | `InvalidIdnEmailError` |
| `assertHostname` | `InvalidHostnameError` |
| `assertAsciiIdn` | `InvalidAsciiIdnError` |
| `assertIdn` | `InvalidIdnError` |
| `assertIPv4` | `InvalidIPv4Error` |
| `assertIPv6` | `InvalidIPv6Error` |
| `assertUuid` | `InvalidUuidError` |
| `assertUriTemplate` | `InvalidUriTemplateError` |
| `assertJsonPointer` | `InvalidJsonPointerError` |
| `assertRelativeJsonPointer` | `InvalidRelativeJsonPointerError` |
| `assertRegex` | `InvalidRegexError` |
| `assertUri`, `assertUriReference` | `InvalidUriError` |
| `assertIri`, `assertIriReference` | `InvalidIriError` |
| `assertDateTimeLocal` | `InvalidDateTimeLocalError` |
| `assertTimeLocal` | `InvalidTimeLocalError` |
| `assertIPv4Cidr` | `InvalidIPv4CidrError` |
| `assertIPv6Cidr` | `InvalidIPv6CidrError` |
| `assertLanguageTag` | `InvalidLanguageTagError` |
| `assertHttpDate` | `InvalidHttpDateError` |
| `assertMediaRange` | `InvalidMediaRangeError` |
| `assertSfBinary` | `InvalidSfBinaryError` |
| `assertSfBoolean` | `InvalidSfBooleanError` |
| `assertSfString` | `InvalidSfStringError` |
| `assertSfToken` | `InvalidSfTokenError` |
| `assertInt8`, `assertInt16`, `assertInt32` | `InvalidInt8Error`, `InvalidInt16Error`, `InvalidInt32Error` |
| `assertUint8`, `assertUint16`, `assertUint32` | `InvalidUint8Error`, `InvalidUint16Error`, `InvalidUint32Error` |
| `assertDoubleInt` | `InvalidDoubleIntError` |
| `assertSfInteger` | `InvalidSfIntegerError` |
| `assertSfDecimal` | `InvalidSfDecimalError` |

The errors for URIs and IRIs come from `@hyperjump/uri`, and their
properties are different. For more information, see
[URIs and IRIs](uris-and-iris.md#errors).

## Errors for numbers

The errors of the number formats, like `InvalidInt32Error`, have `value`,
which is the number, and `reason`. A number has no parts, so they don't
have `part`, `start`, or `end`, and the message has no position:

```text
InvalidInt8Error: Invalid int8: 300 — it must be -128 to 127
InvalidInt8Error: Invalid int8: 1.5 — it isn't an integer
InvalidSfDecimalError: Invalid sf-decimal: 1.2345 — it has 4 digits after the point; an sf-decimal can have 3
```

Their `reason` is one of the following codes:

| Reason | Description |
| --- | --- |
| `not-an-integer` | A format for integers has a number with a fraction, or `NaN` or `Infinity`. |
| `out-of-range` | The number is past one of the format's bounds. The message says which. |
| `too-precise` | An `sf-decimal` has more than 3 digits after the point. |

## Reasons

`reason` is one of the following codes. In TypeScript, each error's
`reason` and `part` are unions of the values that it can have, so
TypeScript checks a `switch` on them.

| Reason | Description |
| --- | --- |
| `invalid-character` | A character isn't allowed in its place. |
| `invalid-value` | A part has the right characters, but it isn't one of the values that it can be, like a month of `13`. |
| `missing` | A part isn't there. |
| `too-long` | A part has more characters than it can have. The span is the characters past the limit. |
| `invalid-order` | A duration's units aren't in the order that they have to be in. |
| `invalid-escape` | An escape isn't followed by a character that it can escape, like a `~` in a JSON Pointer that isn't followed by `0` or `1`, or a `\` in an `sf-string` that isn't followed by `"` or `\`. |
| `invalid-percent-encoding` | A URI Template has a `%` that isn't followed by two hex digits. |
| `nonexistent-date` | The day isn't in the month, like February 29 in a year that isn't a leap year. |
| `nonexistent-leap-second` | A date-time has a second of `60` at a time that didn't have a leap second. |
| `wrong-day-name` | An HTTP date's day name isn't the day of its date. |
| `invalid-idn` | An internationalized hostname breaks a rule of IDNA2008 or UTS #46. |
| `invalid-syntax` | A regular expression doesn't compile. |

For `invalid-idn` and `invalid-syntax`, the message says what's wrong, but
not where. `idn-hostname` and the JavaScript engine don't say where, so
the span is the whole hostname or regular expression:

```text
InvalidRegexError: Invalid regex: (a — Unterminated group
```
