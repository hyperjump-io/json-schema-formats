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
- **The specifications' grammars.** Each format is checked with the ABNF
  from the RFC that defines it.
- **Errors that say what's wrong and where.** Each error has a reason,
  the part of the value that's wrong, and its position.
- **Fast.** TypeScript types included. Works in Node.js and browsers.

## Documentation

- [Install](https://hyperjump.io/json-schema-formats/install/)
- [Validate formats](https://hyperjump.io/json-schema-formats/validate-formats/)
- [Find what's wrong](https://hyperjump.io/json-schema-formats/find-whats-wrong/)
- [URIs and IRIs](https://hyperjump.io/json-schema-formats/uris-and-iris/)

## Contributing

### Tests

Run the tests

```bash
npm test
```

Run the tests with a continuous test runner

```bash
npm test -- --watch
```

Lint and type-check

```bash
npm run lint
npm run type-check
```

The patterns are generated from the ABNF in `scripts/generate-patterns.js`.
After changing it, run

```bash
npm run generate
```

### Docs

The user documentation is in [`website/`](website/README.md), and it's
published to [hyperjump.io](https://hyperjump.io/json-schema-formats/). The
design docs, principles, and style guide are in [`design/`](design/README.md).
