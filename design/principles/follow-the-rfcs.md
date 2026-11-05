# Follow the RFCs

Each format is validated by the ABNF of the specification that JSON
Schema names for it, rule for rule. The rules are copied from the RFC as
they're written, with their comments, so the grammar can be checked
against the RFC line by line (see [Grammars](../components/grammars.md)).

Where an RFC states a limit in a comment, like `01-12` for a month or
`0-255` for an octet, the limit is written out as ABNF next to the
comment, so the grammar says everything it checks.

Where the RFC and what's convenient differ, the RFC wins. Someone who
knows the RFC can predict what happens without reading the docs, and
other implementations that follow it agree with this one.

## Where the grammars differ from the RFCs

Each difference is a decision, and is recorded with the component it's
in:

- A duration's designators are uppercase only (`%s"P"`), though ABNF
  strings match in any case. ISO 8601 has them uppercase, and 1.1.0 did
  the same (see [Dates and times](../components/dates-and-times.md#durations)).
- `time` has no leap seconds, since one can't be checked without a date
  (see [Dates and times](../components/dates-and-times.md#leap-seconds)).
- An email address literal's IPv4 and IPv6 addresses are RFC 3986's
  rules, not RFC 5321's, which have the limits in prose (see
  [Email addresses](../components/email.md)).
- A U-label in an `idn-email` domain is approximated with `ucschar`, and
  checked with UTS #46 after the pattern matches (see
  [Email addresses](../components/email.md#internationalized-domains)).
- RFC 6570's `literals` include `'` (`%x26-3B`), as 1.1.0's did. The
  RFC's range is `%x26 / %x28-3B`, which leaves it out.
