# Answer only what's known

A validator that can't know whether a value is valid throws, instead of
guessing `true` or `false`. A guess is wrong for some callers, and they
can't tell it apart from an answer.

- `isEmail` and `isIdnEmail` throw for an address literal with a tag
  other than `IPv6`.
  A tag has to be registered with IANA, and `IPv6` is the only one in the
  registry, so what follows another tag has no syntax to check (see
  [Email addresses](../components/email.md#address-literals)).

"I don't know" is a valid answer to whether a value has a format.

`@hyperjump/uri` retired this principle on 2026-11-06, so the URI and IRI
functions don't follow it: a URI of a scheme that it doesn't know is
checked with the generic syntax only (see
[URIs and IRIs](../components/uris.md)). This package keeps it for the
validators of its own.
