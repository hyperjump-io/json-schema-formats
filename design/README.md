# Design

`@hyperjump/json-schema-formats` validates the formats that JSON Schema's
`format` keyword names. Each format has an `is` function, which returns a
boolean, and an `assert` function, which throws an error that says what's
wrong and where.

These documents record the decisions made so far, and why. The `.d.ts`
files in `src/` are the source of truth for the API. They're written by
hand and have JSDoc explaining the details. Documentation for users is in
[`website/`](../website/README.md).

## Goals

- Validate each format by the grammar of the specification that defines
  it (see [Follow the RFCs](principles/follow-the-rfcs.md)).
- Fast validators, since a JSON Schema validator calls them for every
  value that has a `format`. Load fast too, since a CLI or a serverless
  function pays for loading every time.
- Errors that say what's wrong and where, for editors and for people
  reading a validation error.
- Small enough for browsers, except for the Unicode tables that
  internationalized hostnames need.

## How it's organized

- **[Principles](principles/README.md)**: the rules decisions are made by.
- **[Style](style/README.md)**: how code here is laid out and written.
- **Components**: how each part works, what was decided, and what was
  rejected. Open questions and known limitations are with the component
  they're about.
- **[Benchmarks](benchmarks/README.md)**: the measurements behind the
  performance decisions.

## Components

- [Grammars](components/grammars.md): the ABNF, and the patterns generated
  from it at build time
- [Diagnosing](components/diagnosing.md): how `assert` functions find
  what's wrong
- [Errors](components/errors.md): a class for each format, reasons, and
  messages
- [Dates and times](components/dates-and-times.md): days in a month, leap
  seconds, durations, and RFC 9557's suffix
- [Hostnames](components/hostnames.md): `hostname`, `idn-hostname`, and
  `idn-hostname`'s dependency
- [Email addresses](components/email.md): address literals and
  internationalized domains
- [URIs and IRIs](components/uris.md): `@hyperjump/uri` and schemes that
  it doesn't know
