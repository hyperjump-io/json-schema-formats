# URIs and IRIs

The functions for the `uri`, `uri-reference`, `iri`, and `iri-reference`
formats come from
[`@hyperjump/uri`](https://github.com/hyperjump-io/uri/blob/main/website/README.md).
They check the generic syntax of RFC 3986 or RFC 3987, and then the rules
of the scheme that the value has. For example, RFC 9110 says that an
`http` URI needs a host, so `http:///a` follows the generic syntax but
isn't a valid `uri`:

```typescript
import { isUri } from "@hyperjump/json-schema-formats";

isUri("https://example.com/schema"); // true
isUri("http:///a"); // false
```

A relative reference doesn't have a scheme, so `isUriReference` and
`isIriReference` check it with the generic syntax only.

## Schemes that aren't known

*Coming soon*

`@hyperjump/uri` knows the `http`, `https`, `file`, `tag`, and `urn`
schemes, and the `uuid` namespace of `urn`. For an identifier with any
other scheme, a function can't know whether the identifier is valid, so
it throws an `UnknownSchemeError` instead of returning `true` or `false`.
For a URN of another namespace, it throws an `UnknownUrnNamespaceError`:

```typescript
import { UnknownSchemeError, isUri } from "@hyperjump/json-schema-formats";

try {
  isUri("mailto:ada@example.com");
} catch (error) {
  if (error instanceof UnknownSchemeError) {
    error.scheme; // "mailto"
  }
}
```

To check identifiers with other schemes, make the schemes with
`defineScheme` from `@hyperjump/uri`, and pass them in the
`customSchemes` option. Install `@hyperjump/uri` to import it:

```typescript
import { defineScheme } from "@hyperjump/uri";
import { isUri } from "@hyperjump/json-schema-formats";

const mailto = defineScheme({ name: "mailto", rule: "mailtoURI" });
const options = { customSchemes: [mailto] };

isUri("mailto:ada@example.com", options); // true
```

A scheme without rules, like this one, checks the generic syntax only.
`urnScheme` makes a `urn` scheme that knows other namespaces. For how to
give a scheme rules, see
[Schemes](https://github.com/hyperjump-io/uri/blob/main/website/schemes.md)
in the `@hyperjump/uri` docs.

The functions also throw an `UnsupportedIpVersionError` for a host that's
an IP address of a future version, like `[v7.future]`.

## Errors

*Coming soon*

`assertUri` and `assertUriReference` throw an `InvalidUriError`, and
`assertIri` and `assertIriReference` throw an `InvalidIriError`:

```text
InvalidUriError: Invalid URI: https://exa mple.com — " " isn't allowed in a host, at 11
```

These errors have `value`, `reason`, `start`, and `end`, like the other
errors in this package. In place of `part`, they have `rule`, the RFC
rule that the value doesn't match, and `component`, the component that's
wrong. For more information, see
[Errors](https://github.com/hyperjump-io/uri/blob/main/website/validate-and-parse.md#errors)
in the `@hyperjump/uri` docs.

The package exports these errors, and the errors for schemes that aren't
known, so you don't need to import them from `@hyperjump/uri`.
