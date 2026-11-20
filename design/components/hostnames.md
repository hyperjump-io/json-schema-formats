# Hostnames (`src/rfc1123.js`, `src/uts46.js`)

JSON Schema changed what `hostname` means in draft-07, so there are two
functions for it:

- `isHostname`: RFC 1123's hostname, for draft-04 to draft-06. Labels of
  letters, digits, and `-`, not at either end, up to 63 characters each,
  and up to 255 characters in all.
- `isAsciiIdn`: an IDNA2008 hostname of A-labels and NR-LDH labels, for
  draft-07 and later.

`isIdn` is `idn-hostname`: an IDNA2008 hostname, with UTS #46's mapping.

## `idn-hostname`

IDNA2008 isn't a grammar. It's rules about Unicode properties, like
which characters are allowed, joining contexts, and bidirectional text,
and checking them takes Unicode tables. `isIdn` uses the `idn-hostname`
package, which has the tables, and they're most of this package's size.

`idn-hostname` throws an error that says which rule a hostname breaks,
but not where. `isIdn` keeps what it throws as the problem, so `isIdn`
and its diagnosis are one function (see
[Diagnosing](diagnosing.md#rejected)).

A hostname that ends with a label separator, like `.` or `。`, isn't
valid. `idn-hostname` allows a trailing one, as the DNS root, so `isIdn`
checks for it first.

### Its version

Each major version of `idn-hostname` is a Unicode version: 15.1, 16.0,
and 17.0 have the same code and get the same fixes, with the tables of
their Unicode version. Normalization and the Unicode properties come from
the JavaScript engine, so each one needs a Node.js whose ICU has its
Unicode version, and this package's `engines` is the range of the one it
uses.

It's 16.0, which needs Node.js 22.12 or later, but not 23.
`@hyperjump/uri` already needs 22.1, so it raises the floor only a
little. 17.0 needs Node.js 24.13.1 and drops Node.js 22 while it's still
an LTS, so it waits until Node.js 22's end of life. 15.1 works on more
versions, but on Unicode that's two years old.

## The `hostname` format from draft-07

`isAsciiIdn` is `isHostname` and `isIdn`. Most hostnames are made of
NR-LDH labels, which are LDH labels without `--` as their third and
fourth characters. IDNA2008 allows them without checking them further.
Only a reserved label, which has `--` there, like an A-label's `xn--`,
needs `idn-hostname`. So `isAsciiIdn` calls `idn-hostname` only when a
hostname has a reserved label, or is longer than 253 characters, which
`idn-hostname` checks too.

For 300,000 random hostnames, `isAsciiIdn` gave the same answers as
`isHostname` and `isIdn` together. It takes 64 nanoseconds for a common
hostname, where it took 145 (see [Speed](../benchmarks/speed.md)).

Rejected: relying on `idn-hostname`'s own check for ASCII hostnames. It's
a second pattern over the same characters that `isHostname` just
checked.
