# Hyperjump - JSON Schema Formats

Validation functions for the formats that the JSON Schema `format`
keyword names, like `date-time`, `email`, and `uri`. Each format has a
function that returns whether a value is valid, and a function that
throws an error that says what's wrong and where.

**[Read the documentation at hyperjump.io](https://hyperjump.io/json-schema-formats/)**

```bash
npm install @hyperjump/json-schema-formats
```

```typescript
import { assertDate, isDate } from "@hyperjump/json-schema-formats";

isDate("2024-02-29"); // true
isDate("2023-02-29"); // false

assertDate("2023-02-29");
// InvalidDateError: Invalid date: 2023-02-29 — 2023-02 has 28 days, at 8
```

- **Every format JSON Schema defines.** Dates and times, email addresses,
  hostnames, IP addresses, URIs and IRIs, UUIDs, URI templates, JSON
  Pointers, and regular expressions.
- **Formats from the JSON Schema and OpenAPI format registries** that
  say exactly what's valid, like `http-date`, `media-range`, and `int32`.
- **The specifications' grammars.** Each string format is checked with
  the grammar from the specification that defines it.
- **Errors that say what's wrong and where.** Each error has a reason,
  the part of the value that's wrong, and its position.
- **Fast.** TypeScript types included. Works in Node.js and browsers.

## Documentation

The documentation is at
**[hyperjump.io/json-schema-formats](https://hyperjump.io/json-schema-formats/)**.

- [Install](https://hyperjump.io/json-schema-formats/install/): setup for
  Node.js, browsers, and TypeScript
- [Validate formats](https://hyperjump.io/json-schema-formats/validate-formats/):
  the function for each format, the formats that changed between JSON
  Schema versions, and the registry formats
- [Find what's wrong](https://hyperjump.io/json-schema-formats/find-whats-wrong/):
  the `assert` functions and the errors that they throw
- [URIs and IRIs](https://hyperjump.io/json-schema-formats/uris-and-iris/):
  schemes, and the errors for URIs and IRIs

## Contributing

See [`design/`](design/README.md) for how it works and why. The
documentation's source is in [`website/`](website/README.md).

```bash
npm install
npm test
npm run lint
npm run type-check
```

## License

MIT
