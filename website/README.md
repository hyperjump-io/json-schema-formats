# JSON Schema formats

`@hyperjump/json-schema-formats` checks whether a string is valid for a
format that the JSON Schema `format` keyword names, like `date-time`,
`email`, or `uri`. Each format has a function that returns `true` or
`false`, and a function that throws an error that says what's wrong and
where.

The following example checks a date, and then finds out why another one
isn't valid:

```typescript
import { assertDate, isDate } from "@hyperjump/json-schema-formats";

isDate("2024-02-29"); // true
isDate("2023-02-29"); // false

assertDate("2023-02-29");
```

```text
InvalidDateError: Invalid date: 2023-02-29 — 2023-02 has 28 days, at 8
```

The package offers the following:

- **Every format JSON Schema defines.** Dates and times, email
  addresses, hostnames, IP addresses, URIs and IRIs, UUIDs, URI
  templates, JSON Pointers, and regular expressions.
- **Formats from the OpenAPI Format Registry** that say exactly what's
  valid, like `http-date`, `media-range`, and `int32`.
- **The specifications' grammars.** The package checks each format with
  the grammar from the RFC that defines it.
- **Errors that say what's wrong and where.** Each error has a reason,
  the part of the value that's wrong, and where that part is.
- **Fast.** Validating a format is a regular expression and, for some
  formats, a check that a regular expression can't do. TypeScript types
  included. Works in Node.js and browsers.

[`@hyperjump/json-schema`](https://github.com/hyperjump-io/json-schema/blob/v2/website/README.md)
uses it to validate the `format` keyword.

## Contents

- [Install](install.md): setup for Node.js, browsers, and TypeScript
- [Validate formats](validate-formats.md): the function for each format,
  the formats that changed between JSON Schema versions, and the OpenAPI
  formats
- [Find what's wrong](find-whats-wrong.md): the `assert` functions and the
  errors that they throw
- [URIs and IRIs](uris-and-iris.md): schemes, and the errors for URIs and
  IRIs
