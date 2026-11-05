# Email addresses (`src/rfc5321.js`, `src/rfc6531.js`)

`email` is RFC 5321's `Mailbox`, with RFC 5322's `atext`. `idn-email` is
RFC 6531's, which extends RFC 5321's rules with `=/`: `atext` and
`qtextSMTP` add `UTF8-non-ascii`, and `sub-domain` adds `U-label`. The
grammar for `idn-email` is RFC 5321's rules spliced in with those
additions, so the two can't drift.

## Address literals

A domain can be an address literal in brackets: an IPv4 address, `IPv6:`
and an IPv6 address, or a tag, `:`, and anything after it
(`General-address-literal`). RFC 5321 writes the IP addresses with their
limits in prose, so the grammar uses RFC 3986's `IPv4address` and
`IPv6address`, which have them in ABNF.

`IPv6` is a tag, so `[IPv6:zz]` matches `General-address-literal` as
well. The tag is known, so a literal with it has to be an IPv6 address,
and `[IPv6:zz]` isn't valid in either format. 1.1.0's `isEmail` threw
"unknown Address Literal Tag: IPv6" for it, and its `isIdnEmail` accepted
it.

A tag has to be registered with IANA, and `IPv6` is the only one in the
registry. What follows another tag has no syntax to check, so `isEmail`
and `isIdnEmail` throw an `Error` for one (see
[Answer only what's known](../principles/answer-only-whats-known.md)).
Both check a literal with `checkAddressLiteral`, so they can't differ.
1.1.0's `isIdnEmail` accepted one if its syntax was valid, which was a
guess.

## Internationalized domains

RFC 6531's `U-label` is a label that UTS #46 allows, which isn't a
grammar. The grammar approximates it with RFC 3987's `ucschar`, so the
pattern accepts what a U-label can have. Then `isIdnEmail` checks the
domain with `isIdn`. An address literal ends with `]` and a domain can't,
so the domain is what's after the last `@` when the value doesn't end
with `]`.

## Diagnosing

The diagnosis reads the local part, the `@`, and the domain. A domain's
labels are diagnosed like a hostname's, without the length limits. An
address literal's IPv4 or IPv6 address is diagnosed with those formats'
diagnoses, moved into place.

For `email`, a character that's allowed only in `idn-email` gets a hint
that says so, since that's the usual mistake.
