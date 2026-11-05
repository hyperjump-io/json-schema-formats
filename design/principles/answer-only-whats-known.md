# Answer only what's known

A validator that can't know whether a value is valid throws, instead of
guessing `true` or `false`. A guess is wrong for some callers, and they
can't tell it apart from an answer.

- `isEmail` and `isIdnEmail` throw for an address literal with a tag
  other than `IPv6`.
  A tag has to be registered with IANA, and `IPv6` is the only one in the
  registry, so what follows another tag has no syntax to check (see
  [Email addresses](../components/email.md#address-literals)).
- `isUri` and the other URI and IRI functions throw for a scheme or a URN
  namespace that `@hyperjump/uri` doesn't know. That's
  `@hyperjump/uri`'s principle too (see [URIs and IRIs](../components/uris.md)).

This package lets those errors through, because "I don't know" is a valid
answer to whether a value has a format. A caller who knows more, like
the schemes their identifiers use, says so in the options.
