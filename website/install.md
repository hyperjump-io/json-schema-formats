# Install

To install the package, run the following command:

```bash
npm install @hyperjump/json-schema-formats
```

The package is an ES module, and it works the same in Node.js and
browsers. It needs Node.js 22.12 or later, but not Node.js 23. Import the
functions that you use:

```typescript
import { isDateTime, isEmail } from "@hyperjump/json-schema-formats";
```

The package depends on two other packages:

- [`@hyperjump/uri`](https://github.com/hyperjump-io/uri/blob/main/website/README.md)
  validates URIs and IRIs.
- [`idn-hostname`](https://www.npmjs.com/package/idn-hostname) validates
  internationalized hostnames. It has the Unicode tables that
  internationalized hostnames need, which are most of the package's size.

## TypeScript

The package includes its type declarations. Each `is` function takes a
string and returns a `boolean`. Each `assert` function takes a string and
returns nothing, or throws an error of its own class. For more
information, see [Find what's wrong](find-whats-wrong.md).

### Types for URIs and IRIs

*Coming soon*

The functions for URIs and IRIs are type guards from `@hyperjump/uri`. The
package exports the types that they narrow to:

| Type | Description |
| --- | --- |
| `Uri` | A string that `isUri` or `assertUri` checked |
| `UriReference` | A string that `isUriReference` or `assertUriReference` checked |
| `Iri` | A string that `isIri` or `assertIri` checked |
| `IriReference` | A string that `isIriReference` or `assertIriReference` checked |

For example, a function that requires a `Uri` accepts a value after
`isUri` checks it:

```typescript
import { isUri } from "@hyperjump/json-schema-formats";
import type { Uri } from "@hyperjump/json-schema-formats";

const fetchSchema = async (uri: Uri) => fetch(uri);

const value: string = "https://example.com/schema";
if (isUri(value)) {
  await fetchSchema(value);
}
```
