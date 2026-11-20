# Support only what's specified

A format is here only if its specification says what's valid. When the
definition leaves that open, any reading of it is this package's choice,
and another implementation can choose differently, so a value would be
valid here and invalid there. A caller can't tell which reading they're
getting, so the package doesn't support the format.

- **`char`**: the OpenAPI Format Registry says only "a single
  character", and names no specification. A code point, a UTF-16 code
  unit, and a grapheme cluster are all characters by some definition.
- **`decimal`**: the registry says that the format is "used in a variety
  of conflicting ways and is not interoperable."

Every JSON Schema format names a specification, so this decides which of
the OpenAPI Format Registry's formats are here (see
[OpenAPI formats](../components/openapi-formats.md)).

A format whose specification is exact but needs a decision about how to
apply it is supported, with the decision recorded with its component.
`http-date`'s 2-digit year is one: RFC 9110 says what it means, but
following it would take a clock (see
[OpenAPI formats](../components/openapi-formats.md#the-rfc850-dates-century)).

This is a different question from
[Follow the RFCs](follow-the-rfcs.md), which says how a format is
validated once it's here.
