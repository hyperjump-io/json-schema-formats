# Diagnosing

Each format's `assert` function checks a value with the format's `is`
function. Only when that's `false` does it run the format's diagnosis,
which finds the first thing that's wrong. A valid value never reaches the
diagnosis, and an `is` function never runs it (see
[Pay only for what you ask for](../principles/pay-only-for-what-you-ask-for.md)).
`@hyperjump/uri` does the same, and this design follows it.

A diagnosis is a function of the value, which returns a problem: a
reason, the part of the value it's in, a span, and the words for the
message (see [Errors](errors.md)).

## How a diagnosis works

`src/diagnose.js` has what diagnoses are made of. Most formats are a
sequence of parts, and a diagnosis walks them with steps. A step reads
one thing where the last one ended, and returns where it ends, or a
problem:

- `field` reads a part that's a run of characters, like a date's month,
  with a sticky pattern like `*DIGIT`. Then it checks what it read with
  the part's rule, like `date-month`. An empty run is `missing` at the
  end of the value, and `invalid-character` anywhere else. A run that
  doesn't match its rule is `invalid-value`, with the whole part as the
  span.
- `delimiter` reads a delimiter, like `-` or `T`.
- `end` checks that nothing follows.

A format whose structure isn't a sequence, like a duration, an email
address, an IPv6 address, or a URI Template, has its own code, built from
the same sticky patterns. A diagnosis of a value inside another, like an
IPv4 address in an IPv6 address or in an email address literal, is
reused, and `nest` moves its span to where the inner value starts.

The checks that a pattern can't do, like whether a day is in its month,
are functions that the `is` function and the diagnosis share, so they
can't disagree.

## Checked by differential testing

A diagnosis is code that has to agree with a pattern. It has to find a
problem in every value that the pattern rejects, and none in a value
that the pattern accepts. `src/assert.test.js` checks that with 10,000
random and mutated values for each format: an `assert` function throws
exactly when the `is` function is `false`, its error is the format's
class, its span is inside the value, and its reason and part are ones
that the error's type declares. It also checks that every declared reason
and part comes up, so the values reach every part of each diagnosis.

When a validator throws, like `isEmail` for an address literal with an
unknown tag, the `assert` function throws the same error.

## Rejected

- **A prefix mode in `@hyperjump/abnf`.** A grammar compiled into a
  pattern for every string that could still become valid would find the
  first bad character for every format, with no code for each one. But
  it says only where, not what: `"3" isn't allowed at 6` for
  `2020-13-01`, where a diagnosis says that the month must be 01-12.
- **A message with no position**, like `Invalid date: 2020-13-01`. An
  editor needs a span to underline, and a person has to find the problem
  themselves.
- **Diagnosing in the `is` functions.** They return a boolean, and JSON
  Schema calls them for every value with a format.

`isIdn` is the exception. It returns whether its diagnosis found a
problem, because `idn-hostname`, which both need, throws to say what's
wrong, and the diagnosis only keeps what it throws.

## Known limitations

- `idn-hostname` and the JavaScript engine say what's wrong but not
  where, so `invalid-idn` and `invalid-syntax` have the whole value as
  their span and no position in the message.
- A diagnosis reports the first problem it finds, in the order it reads
  the value. A value with several problems needs several fixes before
  it's valid.
