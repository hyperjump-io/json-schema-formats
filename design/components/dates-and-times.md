# Dates and times (`src/rfc3339.js`, `src/rfc9557.js`)

`date`, `time`, `date-time`, and `duration` are RFC 3339's `full-date`,
`full-time`, `date-time`, and Appendix A's `duration`. `isDateTimeExt` is
RFC 9557's `date-time-ext`, which isn't a format in JSON Schema or a
registry. Its error names it `date-time-ext`.

A draft of JSON Schema v1 made `date-time` RFC 9557's `date-time-ext`,
and the change was reverted. `isDateTimeExt` was released in 1.1.0 for
it, so it stays, as RFC 9557's rule and not a JSON Schema format. The
JSON Schema Test Suite still has v1 `date-time` tests with RFC 9557
suffixes, so `src/json-schema-test-suite.test.js` doesn't run its v1
`date-time` tests. The suffix tests are in
`test-suite/tests/format-date-time-ext.json`, and the suite's 2020-12
tests run for both functions, since an RFC 3339 `date-time` is a
`date-time-ext`.

Rejected: deprecating `isDateTimeExt`. Removing it would need a major
version, and RFC 9557 is still a specification that says exactly what's
valid.

## Days in a month

The grammar allows a day of `01` to `31` in every month. Whether the day
is in its month is a check after the pattern matches, shared by `isDate`,
`isDateTime`, `isDateTimeExt`, and their diagnoses
(`checkDayInMonth`). It's `nonexistent-date` when it fails.

The pattern fixes where each field is, so the check reads the digits as
numbers by their character codes, without making substrings to parse. A
day up to 28 is in every month, so the check stops there for most dates.
Parsing substrings took four times as long as the pattern did (see
[Speed](../benchmarks/speed.md)).

## Leap seconds

The grammar allows a second of `60`. RFC 3339 says it's valid only at the
end of a day that had a leap second, so `isDateTime` checks it against the
list of leap seconds in `src/date-math.js`, in UTC, after applying the
offset. Only a second that starts with `6` is checked, since `60` is the
only one. It's `nonexistent-leap-second` when it fails.

`time` has no date, so a leap second can't be checked, and `isTime`
rejects one. Its pattern has `time-second` without `60`. The JSON Schema
Test Suite agrees from v1. Its tests that expect some leap seconds to be
valid in `time` are in `optional/format-time`, for releases up to
2020-12, and `src/json-schema-test-suite.test.js` doesn't run them.

Rejected: accepting `60` in any `time`. It would be valid for most times
of day, when a leap second can only be at 23:59:60 UTC.

## Case

ABNF strings match in any case, and RFC 3339 says that `T` and `Z` may be
lowercase, so `isDateTime` accepts `t` and `z`. A duration's designators
are written `%s"P"` and the like, which match only uppercase. ISO 8601,
where durations come from, has them uppercase, and 1.1.0 did the same.

## Durations

RFC 3339's `duration` allows units in order with none skipped, so
`P1Y1D` isn't valid. It has to be `P1Y0M1D`. Weeks can't be with any
other unit. The diagnosis says which rule a unit breaks, with
`invalid-order`, like `days can't come after years without months between
them`.

## RFC 9557's suffix

RFC 9557 defines `date-time-ext` as `date-time suffix`, so it's one
pattern. The checks for days and leap seconds read fixed positions,
which the suffix doesn't move, so they're the same checks. The leap
second check uses only the date-time before the suffix to make its
`Date`.

A time zone name's part can't be `.` or `..`, which the RFC says in a
comment. ABNF can't say "but not", so the grammar writes it as three
alternatives: a part that starts with a letter or `_`, one that starts
with `.` and a character other than `.`, and one that starts with `..`
and has more after it.

`isDateTimeExt` checks the syntax only. A time zone name isn't checked
against the IANA Time Zone Database, and the offset isn't checked against
the time zone.

Rejected: splitting the value at its first `[` and running the
`date-time` and `suffix` patterns on the parts, which 1.1.0 did. It made
two substrings for every value.
