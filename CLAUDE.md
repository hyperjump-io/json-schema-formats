# @hyperjump/json-schema-formats

Validation functions for the JSON Schema `format` keyword: an `is`
function and an `assert` function for each format.

## Docs

- `design/` is for contributors. Start with `design/README.md`, the index,
  and read only the documents about what you're working on. `principles/`
  are the rules decisions are made by, `style/` is how code is laid out,
  and `components/` say how each part works and what was decided, with its
  open questions and known limitations.
- `website/` is the user documentation. It's built into the site at
  hyperjump.io by https://github.com/hyperjump-io/hyperjump.io. The style guide at
  https://github.com/hyperjump-io/hyperjump.io/tree/main/design/style
  says how to write the prose. How to put pages together is at
  https://github.com/hyperjump-io/hyperjump.io/blob/main/design/README.md#writing-docs.
  Vale checks the docs with the rules in `.vale.ini`. Run `vale sync`
  once to download them. A feature that isn't released gets
  `*Coming soon*` on its own line under its heading. `npm version`
  replaces it with `*Added in vX.Y.Z*` (`scripts/version-docs.js`).
- `TODO.md` is the plan and what's next. It isn't committed.
- Prefer many small documents that each cover one thing. A change to how
  something works updates its document in the same commit. A decision
  that's made goes in its component's document, with what was rejected
  and why.

## Development

- `npm test`, `npm run lint`, `npm run type-check`
- `npm run generate` after changing the ABNF in
  `scripts/generate-patterns.js`. It writes `src/patterns.js`, and a test
  fails when that file is out of date.
- The API is declared in hand-written `.d.ts` files next to the JS, which is
  typed with JSDoc. Type-checking includes the declaration files.
- An `assert` function's diagnosis has to find a problem exactly when its
  `is` function is `false`. `src/assert.test.js` checks that, and that
  every reason and part an error declares comes up.

## Working agreements

- Ask before committing. Keep unrelated changes in separate commits.
