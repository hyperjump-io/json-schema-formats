# URIs and IRIs (`src/rfc3986.js`, `src/rfc3987.js`)

`isUri`, `isUriReference`, `isIri`, and `isIriReference`, and their
`assert` functions, are `@hyperjump/uri`'s, re-exported. They check the
generic syntax of RFC 3986 or RFC 3987, then the rules of the value's
scheme if `@hyperjump/uri` knows it. They don't take options.

## Schemes that aren't known

For a scheme or a URN namespace that `@hyperjump/uri` doesn't know, the
functions check the generic syntax only. That's decided in
`@hyperjump/uri`'s design, in `design/components/schemes.md`. Until
2026-11-06, they threw `UnknownSchemeError`, and a caller passed the
schemes they used in the `customSchemes` option. `@hyperjump/uri` dropped
that, and the principle behind it, because the schemes had to reach every
call, through every layer of every dependent. `@hyperjump/json-schema`
calls these functions with only the value, so it was one of those layers.

So the URI and IRI functions are an exception to
[Answer only what's known](../principles/answer-only-whats-known.md),
which this package keeps for its own validators.

1.1.0 used `@hyperjump/uri` v1, which checked only the generic syntax.
For a scheme with rules, like `http`, it could say that a value like
`http:///a` is valid when the scheme's specification says it isn't. That
was a bug, so checking the rules isn't a breaking change.

## What's exported

The package exports the functions, the errors they throw, and the types
they narrow to, so a caller who validates formats needs only this
package.
