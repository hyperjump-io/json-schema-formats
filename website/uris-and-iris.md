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

`@hyperjump/uri` knows the `http`, `https`, `file`, `urn`, `tag`, `data`,
and `did` schemes, and the `uuid` namespace of `urn`. An identifier with
any other scheme, or a URN of another namespace, is checked with the
generic syntax only:

```typescript
import { isUri } from "@hyperjump/json-schema-formats";

isUri("mailto:ada@example.com"); // true
isUri("mailto:ada lovelace@example.com"); // false
isUri("urn:isbn:0451450523"); // true
isUri("urn:uuid:x"); // false
```

For the rules of each scheme that it knows, see
[Schemes](https://github.com/hyperjump-io/uri/blob/main/website/schemes.md)
in the `@hyperjump/uri` docs.

## Errors

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

The package exports these errors, so you don't need to import them from
`@hyperjump/uri`.
