# Pay only for what you ask for

A JSON Schema validator calls an `is` function for every value that has a
`format`, so the `is` functions do only what answering takes. Work that
only some callers need is somewhere they ask for it.

- Finding what's wrong runs only in an `assert` function, and only after
  the value failed (see [Diagnosing](../components/diagnosing.md)). An
  `is` function never builds a reason or a position.
- The patterns are compiled from ABNF at build time, not when the module
  loads, so loading doesn't pay for compiling every format's grammar (see
  [Grammars](../components/grammars.md#generated-at-build-time)).
- A check that a pattern can't do, like whether a day is in its month,
  reads the characters the pattern matched, without making substrings
  (see [Dates and times](../components/dates-and-times.md#days-in-a-month)).
- `isAsciiIdn` calls `idn-hostname` only for a hostname that has a
  reserved label (see [Hostnames](../components/hostnames.md#the-hostname-format-from-draft-07)).
