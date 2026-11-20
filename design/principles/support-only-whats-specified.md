# Support only what's specified

A format is here only if its specification says what's valid. When the
definition leaves that open, any reading of it is this package's choice,
and another implementation can choose differently, so a value would be
valid here and invalid there. A caller can't tell which reading they're
getting, so the package doesn't support the format.

- **`char`**: the format registries say only "a single character", and
  name no specification. A code point, a UTF-16 code
  unit, and a grapheme cluster are all characters by some definition.
- **`decimal`**: the JSON Schema Format Registry gives it "unspecified
  precision and range", and the OpenAPI Format Registry says that the
  format is "used in a variety of conflicting ways and is not
  interoperable."
- **`int64` and `uint64`**: the range is exact, but the string the
  OpenAPI Format Registry recommends past 2^53 has no syntax.

The others it rules out, and why, are in
[Registry formats](../components/registry-formats.md#whats-not-supported).

Every JSON Schema format names a specification, so this decides which of
the format registries' formats are here (see
[Registry formats](../components/registry-formats.md)).

A format whose specification is exact but needs a decision about how to
apply it is supported, with the decision recorded with its component.
`http-date`'s 2-digit year is one: RFC 9110 says what it means, but
following it would take a clock (see
[Registry formats](../components/registry-formats.md#the-rfc850-dates-century)).
The CIDR formats are another: the OpenAPI registry's rules are exact, and leave
whether the bits after the prefix can be set, which the package decides
by what the rules say (see
[Registry formats](../components/registry-formats.md#cidr)).

This is a different question from
[Follow the RFCs](follow-the-rfcs.md), which says how a format is
validated once it's here.
