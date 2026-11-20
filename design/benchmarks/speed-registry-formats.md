# Speed of the registry formats

First recorded 2026-11-20, on Node.js 26.3.1, for the formats from the
format registries.

`benchmark/speed.js` times each function on one valid and one invalid
value, as in [Speed](speed.md). Times are the mean per call, in
nanoseconds. "Before" is the functions as they were added, and "After"
is with the changes below.

| Function | Value | Before | After | After/Before |
| --- | --- | --- | --- | --- |
| `isInt8` | valid | 4 | 4 | 1.00x |
| `isInt8` | invalid | 4 | 4 | 0.98x |
| `isInt16` | valid | 5 | 5 | 1.00x |
| `isInt16` | invalid | 4 | 4 | 1.00x |
| `isInt32` | valid | 5 | 5 | 0.96x |
| `isInt32` | invalid | 5 | 5 | 1.00x |
| `isUint8` | valid | 5 | 5 | 0.99x |
| `isUint8` | invalid | 4 | 4 | 1.00x |
| `isUint16` | valid | 4 | 4 | 1.00x |
| `isUint16` | invalid | 4 | 4 | 1.00x |
| `isUint32` | valid | 5 | 5 | 1.00x |
| `isUint32` | invalid | 5 | 5 | 1.00x |
| `isDoubleInt` | valid | 4 | 4 | 1.00x |
| `isDoubleInt` | invalid | 4 | 4 | 1.00x |
| `isSfInteger` | valid | 5 | 5 | 1.01x |
| `isSfInteger` | invalid | 5 | 5 | 1.00x |
| `isSfDecimal` | valid | 150 | 5 | 0.04x |
| `isSfDecimal` | invalid | 137 | 5 | 0.04x |
| `isDateTimeLocal` | valid | 33 | 31 | 0.96x |
| `isDateTimeLocal` | invalid | 55 | 56 | 1.01x |
| `isTimeLocal` | valid | 19 | 19 | 0.96x |
| `isTimeLocal` | invalid | 15 | 14 | 0.95x |
| `isIPv4Cidr` | valid | 23 | 22 | 0.95x |
| `isIPv4Cidr` | invalid | 28 | 28 | 0.98x |
| `isIPv6Cidr` | valid | 251 | 251 | 1.00x |
| `isIPv6Cidr` | invalid | 202 | 200 | 0.99x |
| `isLanguageTag` | valid | 55 | 55 | 0.98x |
| `isLanguageTag` | invalid | 52 | 53 | 1.01x |
| `isHttpDate` | valid | 148 | 57 | 0.38x |
| `isHttpDate` | invalid | 190 | 108 | 0.57x |
| `isMediaRange` | valid | 78 | 78 | 1.00x |
| `isMediaRange` | invalid | 36 | 35 | 0.98x |
| `isSfString` | valid | 43 | 44 | 1.01x |
| `isSfString` | invalid | 36 | 36 | 0.99x |
| `isSfToken` | valid | 23 | 22 | 0.97x |
| `isSfToken` | invalid | 13 | 12 | 0.94x |
| `isSfBinary` | valid | 70 | 68 | 0.97x |
| `isSfBinary` | invalid | 22 | 21 | 0.96x |
| `isSfBoolean` | valid | 16 | 15 | 0.97x |
| `isSfBoolean` | invalid | 13 | 12 | 0.96x |

The values are `123.456` and `1.2345` for `isSfDecimal`,
`Sun, 06 Nov 1994 08:49:37 GMT` and the same date with `Mon` for
`isHttpDate`, and `2001:db8:85a3::8a2e:370:7334/64` and
`2001:db8::/129` for `isIPv6Cidr`. The rest are in `benchmark/speed.js`.

- `isSfDecimal` checks that `Math.round(n * 1000) / 1000` is `n`, instead
  of counting the digits in `String(n)` (see
  [Registry formats](../components/registry-formats.md#sf-decimal)).
- `isHttpDate`'s checks read the digits by their character codes and the
  month by its letters, instead of parsing substrings. The pattern takes
  about 24 of the 57. An invalid value is slower because it builds the
  problem's text, like `isDateTimeLocal`'s.
- Building `isHttpDate`'s layouts once, instead of an object for each
  call, made no difference.
- `isIPv6Cidr` is the IPv6 address pattern's time, like `isIPv6`. Checking
  the prefix length first, with a pattern on each side of the `/`, took
  26 for `2001:db8::/129` and 309 for the valid value, so it isn't done.
- The rest are within the noise between runs. The integer formats are
  `Number.isInteger` and two comparisons, and the others are one pattern,
  or a pattern and a check on the day.
