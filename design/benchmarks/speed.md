# Speed

First recorded 2026-11-04, on Node.js 22.22.1, against 1.1.0's `src/`.

## Loading

Importing the package, typical of a few processes each:

| Version | Milliseconds |
| --- | --- |
| 1.1.0 | 21 |
| With the patterns compiled when the module loads | 58 |
| With the patterns generated at build time | 23 |

Of the 23, `@hyperjump/uri` and `idn-hostname` take about 8 or 9 each, and
`src/patterns.js` about 3. Compiling the grammars was most of the 58 (see
[Grammars](../components/grammars.md#generated-at-build-time)).

## Validating

`benchmark/speed.js` times each function on one valid and one invalid
value, warmed up, for at least 150 milliseconds. Times are the mean per
call, in nanoseconds.

| Function | Value | 1.1.0 | After | After/1.1.0 |
| --- | --- | --- | --- | --- |
| `isDate` | valid | 203 | 23 | 0.11x |
| `isDate` | invalid | 29 | 27 | 0.94x |
| `isTime` | valid | 23 | 22 | 0.97x |
| `isTime` | invalid | 13 | 13 | 1.01x |
| `isDateTime` | valid | 261 | 35 | 0.14x |
| `isDateTime` | invalid | 193 | 28 | 0.14x |
| `isDateTimeExt` | valid | 381 | 76 | 0.20x |
| `isDateTimeExt` | invalid | 296 | 58 | 0.20x |
| `isDuration` | valid | 31 | 31 | 0.99x |
| `isDuration` | invalid | 25 | 23 | 0.94x |
| `isEmail` | valid | 106 | 57 | 0.54x |
| `isEmail` | invalid | 32 | 30 | 0.95x |
| `isIdnEmail` | valid | 3363 | 3327 | 0.99x |
| `isIdnEmail` | invalid | 21 | 18 | 0.85x |
| `isHostname` | valid | 61 | 70 | 1.16x |
| `isHostname` | invalid | 13 | 12 | 0.90x |
| `isAsciiIdn` | valid | 139 | 64 | 0.46x |
| `isAsciiIdn` | invalid | 20 | 18 | 0.91x |
| `isIdn` | valid | 4438 | 4393 | 0.99x |
| `isIdn` | invalid | 6066 | 6367 | 1.05x |
| `isIPv4` | valid | 27 | 27 | 1.00x |
| `isIPv4` | invalid | 15 | 15 | 0.97x |
| `isIPv6` | valid | 231 | 232 | 1.01x |
| `isIPv6` | invalid | 81 | 80 | 0.99x |
| `isUuid` | valid | 40 | 41 | 1.04x |
| `isUuid` | invalid | 31 | 31 | 0.98x |
| `isUriTemplate` | valid | 85 | 87 | 1.02x |
| `isUriTemplate` | invalid | 24 | 21 | 0.90x |
| `isJsonPointer` | valid | 40 | 41 | 1.00x |
| `isJsonPointer` | invalid | 23 | 23 | 0.99x |
| `isRelativeJsonPointer` | valid | 27 | 28 | 1.05x |
| `isRelativeJsonPointer` | invalid | 17 | 20 | 1.15x |
| `isRegex` | valid | 82 | 80 | 0.97x |
| `isRegex` | invalid | 3069 | 3465 | 1.13x |

- The functions for URIs and IRIs are `@hyperjump/uri`'s, and its own
  benchmarks measure them. 1.1.0 used `@hyperjump/uri` v1, and the copy
  measured here resolved it to v2, so they aren't in the table.
- Dates are faster because the checks after the pattern read the digits
  as numbers instead of parsing substrings (see
  [Days in a month](../components/dates-and-times.md#days-in-a-month)).
  Before that change, `isDate` took 143 for a valid date, and
  `isDateTime` took 114.
- `isDateTimeExt` is one pattern for the date-time and its suffix,
  instead of two on substrings. It took 207.
- `isAsciiIdn` skips `idn-hostname` for a hostname of NR-LDH labels. It
  took 145 (see [Hostnames](../components/hostnames.md#the-hostname-format-from-draft-07)).
- `isEmail` is faster, and `isHostname` a little slower, from how
  `@hyperjump/abnf` compiles their grammars. The rest are within the
  noise between runs, about 10%.
- `isIdn` and `isIdnEmail` take microseconds for a domain that isn't
  ASCII. That's UTS #46 in `idn-hostname`. An invalid `isRegex` is the
  engine throwing.
