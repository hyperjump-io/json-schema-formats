# Types

- The API is declared in hand-written `.d.ts` files next to the JS, and
  they're the source of truth for it. They have JSDoc explaining the
  details, which editors show.
- The JS is typed with JSDoc. Each export's type is the declaration's,
  like `/** @type API.isDate */`. Type-checking (`npm run type-check`)
  includes the declaration files.
- An error class is declared in `src/index.d.ts` with its own `reason`
  and `part` unions, and a private constructor, so throwing one isn't part
  of the API (see [Errors](../components/errors.md)).
