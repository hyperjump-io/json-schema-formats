# URIs and IRIs (`src/rfc3986.js`, `src/rfc3987.js`)

`isUri`, `isUriReference`, `isIri`, and `isIriReference`, and their
`assert` functions, are `@hyperjump/uri`'s, re-exported. They check the
rules of a value's scheme as well as the generic syntax, and they take
`@hyperjump/uri`'s options, so a caller can add schemes with
`customSchemes`.

## Schemes that aren't known

For a scheme or a URN namespace that `@hyperjump/uri` doesn't know, the
functions throw `UnknownSchemeError` or `UnknownUrnNamespaceError`. This
package lets the error through (see
[Answer only what's known](../principles/answer-only-whats-known.md)).
That's decided in `@hyperjump/uri`'s design, in `design/components/schemes.md`.

1.1.0 used `@hyperjump/uri` v1, which checked only the generic syntax, so
it answered for every scheme. That was a bug: for a scheme with rules,
like `http`, the answer could be wrong, and for a scheme it didn't know,
it couldn't know. Throwing fixes it, so it's not a breaking change.

The JSON Schema Test Suite has URIs with the `ftp`, `ldap`, `mailto`,
`news`, and `tel` schemes, and the `urn:example` and `urn:oasis`
namespaces. The runner adds them as schemes without rules, the way a JSON
Schema user would.

## What's exported

The package exports the functions, the errors they throw, and the types
they narrow to, so a caller who validates formats needs only this
package. It doesn't export `defineScheme` or `urnScheme`. A caller who
adds schemes uses `@hyperjump/uri` for them, and its docs.

Open question: whether to export `defineScheme` and `urnScheme`, so that
a caller who adds schemes doesn't need `@hyperjump/uri` as a dependency
of their own.

Rejected: wrapping the functions to catch the unknown-scheme errors and
fall back to the generic syntax. It's the guess that `@hyperjump/uri`
rejected, made here instead.
