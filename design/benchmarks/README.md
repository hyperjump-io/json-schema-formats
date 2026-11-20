# Benchmarks

Measurements behind the performance decisions in
[the design docs](../README.md), one experiment per file, with the date it
was first recorded.

The benchmark code is in `benchmark/`, which isn't committed.
`benchmark/speed.js` times each `is` function on a valid and an invalid
value, and `benchmark/load.js` times importing the package. Each takes
the path to an `index.js`, so it can compare `src/` here with another
version, like a checkout of v1.1.0. Run each in its own process, and
don't run anything else while it runs.

- [Speed](speed.md) (2026-11-04)
- [Speed of the registry formats](speed-registry-formats.md) (2026-11-20)
