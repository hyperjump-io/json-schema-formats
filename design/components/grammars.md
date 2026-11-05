# Grammars

Every format with a grammar is validated by a regular expression compiled
from the ABNF in its RFC by
[`@hyperjump/abnf`](https://github.com/hyperjump-io/abnf). The ABNF is in
`scripts/generate-patterns.js`, copied from the RFCs with their comments
(see [Follow the RFCs](../principles/follow-the-rfcs.md)). Grammars that
build on others splice them in: the email rules include the IP address
rules, RFC 6531's extend RFC 5321's with `=/`, and RFC 9557's `suffix`
references RFC 3339's `time-numoffset`.

`regex` has no grammar here. ECMA-262's is the engine's, so `isRegex`
asks the engine. `idn-hostname` is checked by `idn-hostname`, the
package, since IDNA2008's rules aren't a grammar (see
[Hostnames](hostnames.md)).

## Generated at build time

`npm run generate` compiles the patterns and writes them to
`src/patterns.js`, one export for each, with a comment that names its
rule. `src/patterns.test.js` fails when the file isn't what the script
generates, so a change to the ABNF can't be committed without the
patterns. `@hyperjump/abnf` is only a development dependency.

Compiling every grammar when the module loaded took most of its load
time: 58 milliseconds, against 21 for 1.1.0's hand-written expressions.
With the patterns generated, loading takes 23 (see
[Speed](../benchmarks/speed.md)). `@hyperjump/uri` does the same, for the
same reason.

Rejected:

- **Compiling when the module loads.** Every caller pays for every
  grammar, including a CLI or a serverless function that validates one
  value.
- **Compiling each pattern on its first use.** The first call pays
  instead, and the module has to keep a cache of what it compiled.
- **Hand-written regular expressions**, which is what 1.1.0 had. They can't
  be checked against the RFCs line by line, and a range in a comment, like
  `01-12`, was a hand-written expression that someone had to read to
  check.

## Moving from hand-written expressions

The grammars replaced 1.1.0's hand-written expressions. The two were checked
by differential testing: between 274 and 2,613 distinct random and mutated
values for each of 14 formats, through both. They gave the same answer for
every value, and for strings at each grammar's length limits, like a
63-character label and a 14-character time zone name part.

## Patterns for diagnosing

The patterns that [diagnosing](diagnosing.md) uses are in
`src/patterns.js` too, from the same rules. They're compiled with
`anchored: false` and the `y` flag, so that a diagnosis can set
`lastIndex` and match the longest run of a rule's characters from there,
like `*DIGIT` or `Dot-string`. Since they're made from the same rules, a
diagnosis and a validator agree on which characters a part can have.
