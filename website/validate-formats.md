# Validate formats

Each format has an `is` function, which returns whether a string is valid
for the format:

```typescript
import { isEmail, isIPv4 } from "@hyperjump/json-schema-formats";

isEmail("ada@example.com"); // true
isIPv4("256.0.0.1"); // false
```

The functions take only strings. JSON Schema says that a format applies
only to strings, so check that a value is a string before you call one:

```typescript
const validateEmail = (value: unknown) =>
  typeof value !== "string" || isEmail(value);
```

## Functions

The following table shows the function for each format, and the
specification that defines what's valid:

| Format | Function | Specification |
| --- | --- | --- |
| `date` | `isDate` | [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6) `full-date` |
| `time` | `isTime` | [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6) `full-time` |
| `date-time` | `isDateTime`, or `isDateTimeExt` from v1 of JSON Schema | [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6) `date-time`, or [RFC 9557](https://www.rfc-editor.org/rfc/rfc9557.html#section-4.1) `date-time-ext` |
| `duration` | `isDuration` | [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html#appendix-A) `duration` |
| `email` | `isEmail` | [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321.html#section-4.1.2) `Mailbox` |
| `idn-email` | `isIdnEmail` | [RFC 6531](https://www.rfc-editor.org/rfc/rfc6531.html#section-3.3) `Mailbox` |
| `hostname` | `isAsciiIdn`, or `isHostname` in draft-04 to draft-06 | [RFC 5890](https://www.rfc-editor.org/rfc/rfc5890.html#section-2.3.2.1) A-labels and NR-LDH labels, or [RFC 1123](https://www.rfc-editor.org/rfc/rfc1123.html#section-2.1) |
| `idn-hostname` | `isIdn` | [RFC 5890](https://www.rfc-editor.org/rfc/rfc5890.html#section-2.3.2.1) and [UTS #46](https://www.unicode.org/reports/tr46/) |
| `ipv4` | `isIPv4` | [RFC 2673](https://www.rfc-editor.org/rfc/rfc2673.html#section-3.2) dotted quad |
| `ipv6` | `isIPv6` | [RFC 4291](https://www.rfc-editor.org/rfc/rfc4291.html#section-2.2) |
| `uri` | `isUri` | [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html) `URI` |
| `uri-reference` | `isUriReference` | [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html) `URI-reference` |
| `iri` | `isIri` | [RFC 3987](https://www.rfc-editor.org/rfc/rfc3987.html) `IRI` |
| `iri-reference` | `isIriReference` | [RFC 3987](https://www.rfc-editor.org/rfc/rfc3987.html) `IRI-reference` |
| `uuid` | `isUuid` | [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122.html#section-3) `UUID` |
| `uri-template` | `isUriTemplate` | [RFC 6570](https://www.rfc-editor.org/rfc/rfc6570.html) `URI-Template` |
| `json-pointer` | `isJsonPointer` | [RFC 6901](https://www.rfc-editor.org/rfc/rfc6901.html) `json-pointer` |
| `relative-json-pointer` | `isRelativeJsonPointer` | [`draft-bhutton-relative-json-pointer-00`](https://datatracker.ietf.org/doc/html/draft-bhutton-relative-json-pointer-00) |
| `regex` | `isRegex` | [ECMA-262](https://tc39.es/ecma262/#sec-regexp-regular-expression-objects) |

The functions for URIs and IRIs check a value with the rules of its
scheme, if it's a scheme that they know. For more information, see
[URIs and IRIs](uris-and-iris.md).

## Formats that changed

Two formats mean something different in different versions of JSON
Schema, so each has two functions:

- **`hostname`**: in draft-04 to draft-06, `hostname` is an RFC 1123
  hostname, which is `isHostname`. From draft-07, it's an
  internationalized hostname that has only ASCII characters, which is
  `isAsciiIdn`. `isAsciiIdn` rejects some hostnames that `isHostname`
  accepts, like `ab--c.example.com`, because IDNA2008 reserves labels with
  `--` as their third and fourth characters.
- **`date-time`**: in draft 2020-12 and earlier, `date-time` is an
  RFC 3339 date-time, which is `isDateTime`. From v1, it can have a time
  zone and tags after it, as RFC 9557 defines, which is `isDateTimeExt`:

```typescript
isDateTime("2024-03-10T09:30:00-05:00[America/New_York]"); // false
isDateTimeExt("2024-03-10T09:30:00-05:00[America/New_York]"); // true
```

`isDateTimeExt` checks the syntax only. It doesn't check that a time zone
name is in the IANA Time Zone Database, or that the offset is right for
the time zone.

## Dates and times

`isDate` and `isDateTime` check that the day is in the month, including
February 29 in a leap year:

```typescript
isDate("2024-02-29"); // true
isDate("2023-02-29"); // false
```

A second of `60` is a leap second. `isDateTime` accepts it only at the end
of a day that had a leap second, at 23:59:60 UTC. `isTime` has no date to
check, so it never accepts a leap second:

```typescript
isDateTime("2016-12-31T23:59:60Z"); // true
isDateTime("2017-12-31T23:59:60Z"); // false
isTime("23:59:60Z"); // false
```

RFC 3339 allows a lowercase `t` and `z`, so `isDateTime` accepts
`2024-03-10t09:30:00z`. A duration's letters have to be uppercase, so
`isDuration` rejects `p1d`.

## OpenAPI formats

*Coming soon*

The package also has functions for some of the formats in the
[OpenAPI Format Registry](https://spec.openapis.org/registry/format/),
which OpenAPI documents use beside JSON Schema's. They're the formats
for strings that have a grammar:

| Format | Function | Specification |
| --- | --- | --- |
| `date-time-local` | `isDateTimeLocal` | [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6) `full-date "T" partial-time` |
| `time-local` | `isTimeLocal` | [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6) `partial-time` |
| `ipv4-cidr` | `isIPv4Cidr` | An `ipv4` address and a prefix length, in [RFC 4632](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1)'s notation |
| `ipv6-cidr` | `isIPv6Cidr` | An `ipv6` address and a prefix length, in [RFC 4291](https://www.rfc-editor.org/rfc/rfc4291.html#section-2.3)'s notation |
| `language` | `isLanguageTag` | [RFC 5646](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1) `Language-Tag` |
| `http-date` | `isHttpDate` | [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-5.6.7) `HTTP-date` |
| `media-range` | `isMediaRange` | [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.1) `media-range` |
| `sf-binary` | `isSfBinary` | [RFC 9651](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.5) `sf-binary` |
| `sf-boolean` | `isSfBoolean` | [RFC 9651](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.6) `sf-boolean` |
| `sf-string` | `isSfString` | [RFC 9651](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.3) `sf-string` |
| `sf-token` | `isSfToken` | [RFC 9651](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.4) `sf-token` |

The registry names RFC 7231 for `http-date`. RFC 9110 replaced it, with
the same grammar.

`isDateTimeLocal` and `isTimeLocal` are like `isDateTime` and `isTime`
without an offset. A leap second is at 23:59:60 UTC, and a time without
an offset can't be put in UTC, so they never accept one.

`isIPv4Cidr` and `isIPv6Cidr` take an address, `/`, and a prefix length,
like `10.0.0.0/8` or `2001:db8::/32`. The address can have bits set after
the prefix, like `10.0.0.1/8`, which is how RFC 4291 writes an address
with the prefix of its network. The prefix length can't have a leading
zero, like the octets of an IPv4 address.

`isLanguageTag` checks that a language tag is well-formed: that it
matches RFC 5646's grammar, in any case. A well-formed tag isn't always
valid. It doesn't check the subtags against the IANA Language Subtag
Registry, so `xx-YY` is well-formed, and a tag can repeat a variant, like
`de-DE-1901-1901`.

```typescript
isLanguageTag("zh-Hant-TW"); // true
isLanguageTag("en_US"); // false
```

`isHttpDate` checks more than the grammar:

- The day has to be in its month.
- The day name has to be the date's. RFC 9110 gives the parts of a date
  the meaning they have in RFC 5322, which says so.
- A second of `60` has to be at the end of a day that had a leap second.

```typescript
isHttpDate("Sun, 06 Nov 1994 08:49:37 GMT"); // true
isHttpDate("Mon, 06 Nov 1994 08:49:37 GMT"); // false
```

An HTTP date can also be in two obsolete forms, which `isHttpDate`
accepts: `Sunday, 06-Nov-94 08:49:37 GMT` and `Sun Nov  6 08:49:37 1994`.
The first one's year has only two digits, so the century isn't known.
`isHttpDate` checks only what doesn't need the century. February 29 has
to be in a year that's a leap year in some century, and a leap second
has to be at 23:59:60. The day name isn't checked.

The names of days and months are case-sensitive, as RFC 9110 says, so
`isHttpDate` rejects `sun, 06 Nov 1994 08:49:37 GMT`.

The registry names RFC 8941 for the `sf-` formats. RFC 9651 replaced it,
and the functions follow RFC 9651. The only difference is in
`isSfBinary`: RFC 9651 allows `=` only as padding at the end of the
base64, and RFC 8941's grammar allows it anywhere, so `isSfBinary`
rejects `:a=b:`.

The package doesn't support the registry's formats that don't say
exactly what's valid: `char`, `decimal`, `float`, `double`, `decimal128`,
`int64`, `uint64`, `unixtime`, `binary`, and `html`. For example, the
registry defines a `char` only as "a single character" with no definition
of a character, and it says that `decimal` is "used in a variety of
conflicting ways and is not interoperable." It doesn't support `password` or
`commonmark` either, since every string is valid for them, or `byte` and
`base64url`, which the registry deprecates in favor of `contentEncoding`. The other
formats in the registry don't have functions yet.

## The `email` and `idn-email` formats

An email address's domain can be an address literal in brackets, like
`ada@[192.0.2.1]` or `ada@[IPv6:2001:db8::1]`. RFC 5321 allows other kinds
of address literal too, which start with a tag that names the kind, like
`ada@[x-example:abc]`. IANA registers the tags, and `IPv6` is the only one
in its registry, so `isEmail` can't know whether another kind is valid. It
throws an `Error` for a tag other than `IPv6`. `isIdnEmail` does the
same.

`isIdnEmail` checks the domain as an internationalized hostname, like
`isIdn` does.

## Regular expressions

`isRegex` returns whether JavaScript can compile a string as a regular
expression with the `u` flag. JSON Schema says that a regular expression
uses ECMA-262's syntax, and the `u` flag makes the syntax strict, so that
a typo like `\a` isn't valid.
