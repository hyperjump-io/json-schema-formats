import type { Iri, IriReference, Uri, UriReference } from "@hyperjump/uri";

export type { Iri, IriReference, Uri, UriReference } from "@hyperjump/uri";
export { InvalidUriError, InvalidIriError } from "@hyperjump/uri";

/**
 * The 'date' format. Validates that a string represents a date according to
 * [RFC 3339, section 5.6](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6).
 *
 * @see [JSON Schema Core, section 7.3.1](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.1)
 */
export const isDate: (date: string) => boolean;

/**
 * Checks that `date` is a date, like {@link isDate}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidDateError} If `date` isn't a date.
 */
export const assertDate: (date: string) => void;

/**
 * The 'time' format. Validates that a string represents a time according to
 * [RFC 3339, section 5.6](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6).
 *
 * **NOTE**: Leap seconds are only allowed on specific dates. Since there is no date
 * in this context, leap seconds are never allowed.
 *
 * @see [JSON Schema Core, section 7.3.1](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.1)
 */
export const isTime: (time: string) => boolean;

/**
 * Checks that `time` is a time, like {@link isTime}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidTimeError} If `time` isn't a time.
 */
export const assertTime: (time: string) => void;

/**
 * The 'date-time' format. Validates that a string represents a date-time
 * according to [RFC 3339, section 5.6](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6).
 *
 * **NOTE**: The 'date-time' format changed in v1. Use {@link isDateTimeExt}
 * for v1 and later.
 *
 * @see [JSON Schema Core, section 7.3.1](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.1)
 */
export const isDateTime: (dateTime: string) => boolean;

/**
 * Checks that `dateTime` is a date-time, like {@link isDateTime}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidDateTimeError} If `dateTime` isn't a date-time.
 */
export const assertDateTime: (dateTime: string) => void;

/**
 * Validates that a string represents a date-time with an optional time zone
 * and suffix tags according to the "date-time-ext" rule in
 * [RFC 9557, section 4.1](https://www.rfc-editor.org/rfc/rfc9557.html#section-4.1).
 * It isn't a JSON Schema format. JSON Schema's 'date-time' is
 * {@link isDateTime}.
 *
 * **NOTE**: Validation is syntactic only. Time zone names are not checked
 * against the IANA Time Zone Database and the offset is not checked for
 * consistency with the time zone.
 *
 * @see [RFC 9557, section 4.1](https://www.rfc-editor.org/rfc/rfc9557.html#section-4.1)
 */
export const isDateTimeExt: (dateTimeExt: string) => boolean;

/**
 * Checks that `dateTimeExt` is a date-time with an optional time zone and suffix tags, like {@link isDateTimeExt}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidDateTimeExtError} If `dateTimeExt` isn't a date-time with an optional time zone and suffix tags.
 */
export const assertDateTimeExt: (dateTimeExt: string) => void;

/**
 * The 'duration' format. Validates that a string represents a duration
 * according to [RFC 3339, Appendix A](https://www.rfc-editor.org/rfc/rfc3339.html#appendix-A).
 *
 * @see [JSON Schema Core, section 7.3.1](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.1)
 */
export const isDuration: (duration: string) => boolean;

/**
 * Checks that `duration` is a duration, like {@link isDuration}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidDurationError} If `duration` isn't a duration.
 */
export const assertDuration: (duration: string) => void;

/**
 * The 'email' format. Validates that a string represents an email as defined by
 * the "Mailbox" ABNF rule in [RFC 5321, section 4.1.2](https://www.rfc-editor.org/rfc/rfc5321.html#section-4.1.2).
 *
 * @throws {Error} If the address literal has a tag that isn't known, like
 *   `[x-example:abc]`. `IPv6` is the only tag that's registered, so whether
 *   what follows another one is valid can't be known.
 * @see [JSON Schema Core, section 7.3.2](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.2)
 */
export const isEmail: (email: string) => boolean;

/**
 * Checks that `email` is an email address, like {@link isEmail}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidEmailError} If `email` isn't an email address.
 * @throws {Error} If the address literal has a tag that isn't known, like {@link isEmail}.
 */
export const assertEmail: (email: string) => void;

/**
 * The 'idn-email' format. Validates that a string represents an email as
 * defined by the "Mailbox" ABNF rule in [RFC 6531, section 3.3](https://www.rfc-editor.org/rfc/rfc6531.html#section-3.3).
 *
 * @throws {Error} If the address literal has a tag that isn't known, like
 *   {@link isEmail}.
 * @see [JSON Schema Core, section 7.3.2](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.2)
 */
export const isIdnEmail: (email: string) => boolean;

/**
 * Checks that `email` is an internationalized email address, like {@link isIdnEmail}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidIdnEmailError} If `email` isn't an internationalized email address.
 * @throws {Error} If the address literal has a tag that isn't known, like {@link isEmail}.
 */
export const assertIdnEmail: (email: string) => void;

/**
 * The 'hostname' format in draft-04 - draft-06. Validates that a string
 * represents a hostname as defined by [RFC 1123, section 2.1](https://www.rfc-editor.org/rfc/rfc1123.html#section-2.1).
 *
 * **NOTE**: The 'hostname' format changed in draft-07. Use {@link isAsciiIdn} for
 * draft-07 and later.
 *
 * @see [JSON Schema Core, section 7.3.3](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.3)
 */
export const isHostname: (hostname: string) => boolean;

/**
 * Checks that `hostname` is a hostname, like {@link isHostname}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidHostnameError} If `hostname` isn't a hostname.
 */
export const assertHostname: (hostname: string) => void;

/**
 * The 'hostname' format since draft-07. Validates that a string represents an
 * IDNA2008 internationalized domain name consiting of only A-labels and NR-LDH
 * labels as defined by [RFC 5890, section 2.3.2.1](https://www.rfc-editor.org/rfc/rfc5890.html#section-2.3.2.3).
 *
 * **NOTE**: The 'hostname' format changed in draft-07. Use {@link isHostname}
 * for draft-06 and earlier.
 *
 * @see [JSON Schema Core, section 7.3.3](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.3)
 */
export const isAsciiIdn: (hostname: string) => boolean;

/**
 * Checks that `hostname` is an IDNA2008 hostname of A-labels and NR-LDH labels, like {@link isAsciiIdn}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidAsciiIdnError} If `hostname` isn't an IDNA2008 hostname of A-labels and NR-LDH labels.
 */
export const assertAsciiIdn: (hostname: string) => void;

/**
 * The 'idn-hostname' format. Validates that a string represents an IDNA2008
 * internationalized domain name as defined by [RFC 5890, section 2.3.2.1](https://www.rfc-editor.org/rfc/rfc5890.html#section-2.3.2.1).
 *
 * @see [JSON Schema Core, section 7.3.3](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.3)
 */
export const isIdn: (hostname: string) => boolean;

/**
 * Checks that `hostname` is an IDNA2008 internationalized hostname, like {@link isIdn}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidIdnError} If `hostname` isn't an IDNA2008 internationalized hostname.
 */
export const assertIdn: (hostname: string) => void;

/**
 * The 'ipv4' format. Validates that a string represents an IPv4 address
 * according to the "dotted-quad" ABNF syntax as defined in
 * [RFC 2673, section 3.2](https://www.rfc-editor.org/rfc/rfc2673.html#section-3.2).
 *
 * @see [JSON Schema Core, section 7.3.4](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.4)
 */
export const isIPv4: (ip: string) => boolean;

/**
 * Checks that `ip` is an IPv4 address, like {@link isIPv4}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidIPv4Error} If `ip` isn't an IPv4 address.
 */
export const assertIPv4: (ip: string) => void;

/**
 * The 'ipv6' format. Validates that a string represents an IPv6 address as
 * defined in [RFC 4291, section 2.2](https://www.rfc-editor.org/rfc/rfc4291.html#section-2.2).
 *
 * @see [JSON Schema Core, section 7.3.4](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.4)
 */
export const isIPv6: (ip: string) => boolean;

/**
 * Checks that `ip` is an IPv6 address, like {@link isIPv6}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidIPv6Error} If `ip` isn't an IPv6 address.
 */
export const assertIPv6: (ip: string) => void;

/**
 * The 'uri' format. Validates that a string represents a URI as defined by [RFC
 * 3986](https://www.rfc-editor.org/rfc/rfc3986.html), with the rules of its
 * scheme, by [`@hyperjump/uri`](https://hyperjump.io/uri/).
 *
 * **NOTE**: A URI of a scheme that `@hyperjump/uri` doesn't know is checked
 * with the generic syntax only. It knows `http`, `https`, `file`, `urn` (with
 * the `uuid` namespace), `tag`, `data`, and `did`.
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isUri: (uri: string) => uri is Uri;

/**
 * Checks that `uri` is a URI, like {@link isUri}, and throws an error that
 * says what's wrong and where if it isn't.
 *
 * @throws {InvalidUriError} If `uri` isn't a URI.
 */
export const assertUri: (uri: string) => asserts uri is Uri;

/**
 * The 'uri-reference' format. Validates that a string represents a URI
 * Reference as defined by [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html),
 * with the rules of its scheme if it has one, like {@link isUri}.
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isUriReference: (uri: string) => uri is UriReference;

/**
 * Checks that `uri` is a URI Reference, like {@link isUriReference}.
 *
 * @throws {InvalidUriError} If `uri` isn't a URI Reference.
 */
export const assertUriReference: (uri: string) => asserts uri is UriReference;

/**
 * The 'iri' format. Validates that a string represents an IRI as defined by
 * [RFC 3987](https://www.rfc-editor.org/rfc/rfc3987.html), with the rules of
 * its scheme, like {@link isUri}.
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isIri: (iri: string) => iri is Iri;

/**
 * Checks that `iri` is an IRI, like {@link isIri}.
 *
 * @throws {InvalidIriError} If `iri` isn't an IRI.
 */
export const assertIri: (iri: string) => asserts iri is Iri;

/**
 * The 'iri-reference' format. Validates that a string represents an IRI
 * Reference as defined by [RFC 3987](https://www.rfc-editor.org/rfc/rfc3987.html),
 * with the rules of its scheme if it has one, like {@link isUri}.
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isIriReference: (iri: string) => iri is IriReference;

/**
 * Checks that `iri` is an IRI Reference, like {@link isIriReference}.
 *
 * @throws {InvalidIriError} If `iri` isn't an IRI Reference.
 */
export const assertIriReference: (iri: string) => asserts iri is IriReference;

/**
 * The 'uuid' format. Validates that a string represents a UUID address as
 * defined by [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122.html).
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isUuid: (uuid: string) => boolean;

/**
 * Checks that `uuid` is a UUID, like {@link isUuid}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidUuidError} If `uuid` isn't a UUID.
 */
export const assertUuid: (uuid: string) => void;

/**
 * The 'uri-template' format. Validates that a string represents a URI Template
 * as defined by [RFC 6570](https://www.rfc-editor.org/rfc/rfc6570.html).
 *
 * @see [JSON Schema Core, section 7.3.6](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.6)
 */
export const isUriTemplate: (uriTemplate: string) => boolean;

/**
 * Checks that `uriTemplate` is a URI Template, like {@link isUriTemplate}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidUriTemplateError} If `uriTemplate` isn't a URI Template.
 */
export const assertUriTemplate: (uriTemplate: string) => void;

/**
 * The 'json-pointer' format. Validates that a string represents a JSON Pointer
 * as defined by [RFC 6901](https://www.rfc-editor.org/rfc/rfc6901.html).
 *
 * @see [JSON Schema Core, section 7.3.7](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.7)
 */
export const isJsonPointer: (pointer: string) => boolean;

/**
 * Checks that `pointer` is a JSON Pointer, like {@link isJsonPointer}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidJsonPointerError} If `pointer` isn't a JSON Pointer.
 */
export const assertJsonPointer: (pointer: string) => void;

/**
 * The 'relative-json-pointer' format. Validates that a string represents an IRI
 * Reference as defined by [draft-bhutton-relative-json-pointer-00](https://datatracker.ietf.org/doc/html/draft-bhutton-relative-json-pointer-00).
 *
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isRelativeJsonPointer: (pointer: string) => boolean;

/**
 * Checks that `pointer` is a Relative JSON Pointer, like {@link isRelativeJsonPointer}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidRelativeJsonPointerError} If `pointer` isn't a Relative JSON Pointer.
 */
export const assertRelativeJsonPointer: (pointer: string) => void;

/**
 * The 'regex' format. Validates that a string represents a regular expression
 * as defined by [ECMA-262](https://262.ecma-international.org/5.1/).
 *
 * @see [JSON Schema Core, section 7.3.8](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.8)
 */
export const isRegex: (regex: string) => boolean;

/**
 * Checks that `regex` is an ECMA-262 regular expression, like {@link isRegex}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidRegexError} If `regex` isn't an ECMA-262 regular expression.
 */
export const assertRegex: (regex: string) => void;

/**
 * The 'int8' format from the JSON Schema and OpenAPI format registries.
 * Validates that a number is a signed 8-bit integer: an integer from -128 to
 * 127.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/int8.html)
 */
export const isInt8: (n: number) => boolean;

/**
 * Checks that `n` is a signed 8-bit integer, like {@link isInt8}, and throws an
 * error that says what's wrong if it isn't.
 *
 * @throws {InvalidInt8Error} If `n` isn't a signed 8-bit integer.
 */
export const assertInt8: (n: number) => void;

/**
 * The 'int16' format from the JSON Schema and OpenAPI format registries.
 * Validates that a number is a signed 16-bit integer: an integer from -32768 to
 * 32767.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/int16.html)
 */
export const isInt16: (n: number) => boolean;

/**
 * Checks that `n` is a signed 16-bit integer, like {@link isInt16}, and throws an
 * error that says what's wrong if it isn't.
 *
 * @throws {InvalidInt16Error} If `n` isn't a signed 16-bit integer.
 */
export const assertInt16: (n: number) => void;

/**
 * The 'int32' format from the JSON Schema and OpenAPI format registries.
 * Validates that a number is a signed 32-bit integer: an integer from
 * -2147483648 to 2147483647.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/int32.html)
 */
export const isInt32: (n: number) => boolean;

/**
 * Checks that `n` is a signed 32-bit integer, like {@link isInt32}, and throws an
 * error that says what's wrong if it isn't.
 *
 * @throws {InvalidInt32Error} If `n` isn't a signed 32-bit integer.
 */
export const assertInt32: (n: number) => void;

/**
 * The 'uint8' format from the JSON Schema and OpenAPI format registries.
 * Validates that a number is an unsigned 8-bit integer: an integer from 0 to
 * 255.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/uint8.html)
 */
export const isUint8: (n: number) => boolean;

/**
 * Checks that `n` is an unsigned 8-bit integer, like {@link isUint8}, and throws an
 * error that says what's wrong if it isn't.
 *
 * @throws {InvalidUint8Error} If `n` isn't an unsigned 8-bit integer.
 */
export const assertUint8: (n: number) => void;

/**
 * The 'uint16' format from the OpenAPI Format Registry. Validates that a
 * number is an unsigned 16-bit integer: an integer from 0 to 65535.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/uint16.html)
 */
export const isUint16: (n: number) => boolean;

/**
 * Checks that `n` is an unsigned 16-bit integer, like {@link isUint16}, and throws an
 * error that says what's wrong if it isn't.
 *
 * @throws {InvalidUint16Error} If `n` isn't an unsigned 16-bit integer.
 */
export const assertUint16: (n: number) => void;

/**
 * The 'uint32' format from the OpenAPI Format Registry. Validates that a
 * number is an unsigned 32-bit integer: an integer from 0 to 4294967295.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/uint32.html)
 */
export const isUint32: (n: number) => boolean;

/**
 * Checks that `n` is an unsigned 32-bit integer, like {@link isUint32}, and throws an
 * error that says what's wrong if it isn't.
 *
 * @throws {InvalidUint32Error} If `n` isn't an unsigned 32-bit integer.
 */
export const assertUint32: (n: number) => void;

/**
 * The 'double-int' format from the JSON Schema and OpenAPI format registries.
 * Validates that a number is an integer that a double can store without losing
 * precision: from -(2^53 - 1) to 2^53 - 1, like `Number.isSafeInteger`.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/double-int.html)
 */
export const isDoubleInt: (n: number) => boolean;

/**
 * Checks that `n` is an integer that a double can store without losing
 * precision, like {@link isDoubleInt}, and throws an error that says what's
 * wrong if it isn't.
 *
 * @throws {InvalidDoubleIntError} If `n` isn't such an integer.
 */
export const assertDoubleInt: (n: number) => void;

/**
 * The 'sf-integer' format from the JSON Schema and OpenAPI format registries.
 * Validates that a number is a structured field integer as defined by
 * [RFC 9651, section 3.3.1](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.1):
 * an integer from -999,999,999,999,999 to 999,999,999,999,999.
 *
 * @see [RFC 9651, section 3.3.1](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.1)
 */
export const isSfInteger: (n: number) => boolean;

/**
 * Checks that `n` is a structured field integer, like {@link isSfInteger},
 * and throws an error that says what's wrong if it isn't.
 *
 * @throws {InvalidSfIntegerError} If `n` isn't a structured field integer.
 */
export const assertSfInteger: (n: number) => void;

/**
 * The 'sf-decimal' format from the JSON Schema and OpenAPI format registries.
 * Validates that a number is a structured field decimal as defined by
 * [RFC 9651, section 3.3.2](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.2):
 * at most 12 digits before the point and at most 3 after it, in the shortest
 * decimal that's the number.
 *
 * @see [RFC 9651, section 3.3.2](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.2)
 */
export const isSfDecimal: (n: number) => boolean;

/**
 * Checks that `n` is a structured field decimal, like {@link isSfDecimal},
 * and throws an error that says what's wrong if it isn't.
 *
 * @throws {InvalidSfDecimalError} If `n` isn't a structured field decimal.
 */
export const assertSfDecimal: (n: number) => void;

/**
 * The 'date-time-local' format from the OpenAPI Format Registry. Validates
 * that a string represents a date-time without an offset: RFC 3339's
 * `full-date "T" partial-time`, from [RFC 3339, section 5.6](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6).
 *
 * **NOTE**: Leap seconds are only allowed at specific times in UTC. Since
 * there is no offset in this context, leap seconds are never allowed.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/date-time-local.html)
 */
export const isDateTimeLocal: (dateTime: string) => boolean;

/**
 * Checks that `dateTime` is a date-time without an offset, like
 * {@link isDateTimeLocal}, and throws an error that says what's wrong and
 * where if it isn't.
 *
 * @throws {InvalidDateTimeLocalError} If `dateTime` isn't a date-time without an offset.
 */
export const assertDateTimeLocal: (dateTime: string) => void;

/**
 * The 'time-local' format from the OpenAPI Format Registry. Validates that a
 * string represents a time without an offset: RFC 3339's `partial-time`, from
 * [RFC 3339, section 5.6](https://www.rfc-editor.org/rfc/rfc3339.html#section-5.6).
 *
 * **NOTE**: Leap seconds are only allowed on specific dates, in UTC. Since
 * there is no date or offset in this context, leap seconds are never allowed.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/time-local.html)
 */
export const isTimeLocal: (time: string) => boolean;

/**
 * Checks that `time` is a time without an offset, like {@link isTimeLocal},
 * and throws an error that says what's wrong and where if it isn't.
 *
 * @throws {InvalidTimeLocalError} If `time` isn't a time without an offset.
 */
export const assertTimeLocal: (time: string) => void;

/**
 * The 'ipv4-cidr' format from the OpenAPI Format Registry. Validates that a
 * string is an IPv4 address, like {@link isIPv4}, then "/" and a prefix
 * length of 0 to 32, in the notation of [RFC 4632, section 3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1).
 *
 * **NOTE**: The bits of the address after the prefix can be set, as in
 * `10.0.0.1/8`, and the prefix length can't have a leading zero.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/ipv4-cidr.html)
 */
export const isIPv4Cidr: (cidr: string) => boolean;

/**
 * Checks that `cidr` is an IPv4 address with a prefix length, like
 * {@link isIPv4Cidr}, and throws an error that says what's wrong and where
 * if it isn't.
 *
 * @throws {InvalidIPv4CidrError} If `cidr` isn't an IPv4 address with a prefix length.
 */
export const assertIPv4Cidr: (cidr: string) => void;

/**
 * The 'ipv6-cidr' format from the OpenAPI Format Registry. Validates that a
 * string is an IPv6 address, like {@link isIPv6}, then "/" and a prefix
 * length of 0 to 128, in the notation of [RFC 4291, section 2.3](https://www.rfc-editor.org/rfc/rfc4291.html#section-2.3).
 *
 * **NOTE**: The bits of the address after the prefix can be set, as in
 * `2001:db8::1/32`, and the prefix length can't have a leading zero.
 *
 * @see [OpenAPI Format Registry](https://spec.openapis.org/registry/format/ipv6-cidr.html)
 */
export const isIPv6Cidr: (cidr: string) => boolean;

/**
 * Checks that `cidr` is an IPv6 address with a prefix length, like
 * {@link isIPv6Cidr}, and throws an error that says what's wrong and where
 * if it isn't.
 *
 * @throws {InvalidIPv6CidrError} If `cidr` isn't an IPv6 address with a prefix length.
 */
export const assertIPv6Cidr: (cidr: string) => void;

/**
 * The 'language' format from the OpenAPI Format Registry. Validates that a
 * string is a well-formed language tag: one that matches the "Language-Tag"
 * rule in [RFC 5646, section 2.1](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1),
 * in any case.
 *
 * **NOTE**: A well-formed tag isn't always valid. The subtags aren't checked
 * against the IANA Language Subtag Registry, and a tag can repeat a variant
 * or a singleton.
 *
 * @see [RFC 5646, section 2.1](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1)
 */
export const isLanguageTag: (tag: string) => boolean;

/**
 * Checks that `tag` is a well-formed language tag, like
 * {@link isLanguageTag}, and throws an error that says what's wrong and
 * where if it isn't.
 *
 * @throws {InvalidLanguageTagError} If `tag` isn't a well-formed language tag.
 */
export const assertLanguageTag: (tag: string) => void;

/**
 * The 'http-date' format from the JSON Schema and OpenAPI format registries.
 * Validates that a string represents an HTTP date as defined by
 * [RFC 9110, section 5.6.7](https://www.rfc-editor.org/rfc/rfc9110.html#section-5.6.7),
 * which obsoletes RFC 7231 with the same grammar. The day has to be in its
 * month, the day name has to be the date's, and a second of 60 has to be a leap
 * second.
 *
 * **NOTE**: The obsolete RFC 850 form has a 2-digit year, with no century.
 * Its day name isn't checked, and its leap second is only checked for being
 * at 23:59:60.
 *
 * @see [RFC 9110, section 5.6.7](https://www.rfc-editor.org/rfc/rfc9110.html#section-5.6.7)
 */
export const isHttpDate: (date: string) => boolean;

/**
 * Checks that `date` is an HTTP date, like {@link isHttpDate}, and throws an
 * error that says what's wrong and where if it isn't.
 *
 * @throws {InvalidHttpDateError} If `date` isn't an HTTP date.
 */
export const assertHttpDate: (date: string) => void;

/**
 * The 'media-range' format from the JSON Schema and OpenAPI format registries.
 * Validates that a string represents a media range as defined by
 * [RFC 9110, section 12.5.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.1).
 *
 * @see [RFC 9110, section 12.5.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.1)
 */
export const isMediaRange: (mediaRange: string) => boolean;

/**
 * Checks that `mediaRange` is a media range, like {@link isMediaRange}, and
 * throws an error that says what's wrong and where if it isn't.
 *
 * @throws {InvalidMediaRangeError} If `mediaRange` isn't a media range.
 */
export const assertMediaRange: (mediaRange: string) => void;

/**
 * The 'sf-binary' format from the JSON Schema and OpenAPI format registries.
 * Validates that a string represents a structured field byte sequence as
 * defined by
 * [RFC 9651, section 3.3.5](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.5),
 * which obsoletes the RFC 8941 that the registries name. `=` is only allowed as
 * padding at the end, which RFC 8941's grammar didn't require.
 *
 * @see [RFC 9651, section 3.3.5](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.5)
 */
export const isSfBinary: (binary: string) => boolean;

/**
 * Checks that `binary` is a structured field byte sequence, like
 * {@link isSfBinary}, and throws an error that says what's wrong and where if
 * it isn't.
 *
 * @throws {InvalidSfBinaryError} If `binary` isn't a structured field byte sequence.
 */
export const assertSfBinary: (binary: string) => void;

/**
 * The 'sf-boolean' format from the JSON Schema and OpenAPI format registries.
 * Validates that a string represents a structured field boolean as defined by
 * [RFC 9651, section 3.3.6](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.6).
 *
 * @see [RFC 9651, section 3.3.6](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.6)
 */
export const isSfBoolean: (boolean: string) => boolean;

/**
 * Checks that `boolean` is a structured field boolean, like
 * {@link isSfBoolean}, and throws an error that says what's wrong and where
 * if it isn't.
 *
 * @throws {InvalidSfBooleanError} If `boolean` isn't a structured field boolean.
 */
export const assertSfBoolean: (boolean: string) => void;

/**
 * The 'sf-string' format from the JSON Schema and OpenAPI format registries.
 * Validates that a string represents a structured field string as defined by
 * [RFC 9651, section 3.3.3](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.3),
 * with its quotes.
 *
 * @see [RFC 9651, section 3.3.3](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.3)
 */
export const isSfString: (string: string) => boolean;

/**
 * Checks that `string` is a structured field string, like
 * {@link isSfString}, and throws an error that says what's wrong and where
 * if it isn't.
 *
 * @throws {InvalidSfStringError} If `string` isn't a structured field string.
 */
export const assertSfString: (string: string) => void;

/**
 * The 'sf-token' format from the JSON Schema and OpenAPI format registries.
 * Validates that a string represents a structured field token as defined by
 * [RFC 9651, section 3.3.4](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.4).
 *
 * @see [RFC 9651, section 3.3.4](https://www.rfc-editor.org/rfc/rfc9651.html#section-3.3.4)
 */
export const isSfToken: (token: string) => boolean;

/**
 * Checks that `token` is a structured field token, like {@link isSfToken},
 * and throws an error that says what's wrong and where if it isn't.
 *
 * @throws {InvalidSfTokenError} If `token` isn't a structured field token.
 */
export const assertSfToken: (token: string) => void;

/**
 * What's wrong with a value. Each error has the reasons that it can have.
 *
 * - `invalid-character`: a character isn't allowed where it is.
 * - `invalid-value`: a part has the right characters, but isn't one of the
 *   values it can be, like a month of `13`.
 * - `missing`: a part isn't there. The span is empty, where it would be.
 * - `too-long`: a part has more characters than it can. The span is the
 *   characters past the limit.
 * - `invalid-order`: a duration's units aren't in the order they have to be.
 * - `invalid-escape`: an escape isn't followed by a character it can escape,
 *   like a JSON Pointer's `~` that isn't followed by `0` or `1`.
 * - `invalid-percent-encoding`: a `%` isn't followed by two hex digits.
 * - `nonexistent-date`: the day isn't in the month, like `2021-02-29`.
 * - `nonexistent-leap-second`: there wasn't a leap second at that time.
 * - `wrong-day-name`: an HTTP date's day name isn't the day of its date.
 * - `invalid-idn`: an IDN hostname breaks a rule of IDNA2008 or UTS #46. The
 *   message says which, and the span is the whole hostname.
 * - `invalid-syntax`: a regular expression doesn't compile. The message is
 *   the engine's, and the span is the whole value.
 */
export type FormatErrorReason
  = "invalid-character"
    | "invalid-value"
    | "missing"
    | "too-long"
    | "invalid-order"
    | "invalid-escape"
    | "invalid-percent-encoding"
    | "nonexistent-date"
    | "nonexistent-leap-second"
    | "wrong-day-name"
    | "invalid-idn"
    | "invalid-syntax";

/**
 * What's wrong with a number. Each number format's error has the reasons
 * that it can have.
 *
 * - `not-an-integer`: an integer format's value has a fraction, or is `NaN`
 *   or `Infinity`.
 * - `out-of-range`: the value is past one of the format's bounds. The
 *   message says which.
 * - `too-precise`: an `sf-decimal` has more than 3 digits after the point.
 */
export type NumberFormatErrorReason
  = "not-an-integer"
    | "out-of-range"
    | "too-precise";

/**
 * The properties of every error that a number format's `assert*` function
 * throws. `R` is the reasons the error can have. A number has no parts, so
 * there's no span.
 */
type NumberFormatErrorProperties<R extends NumberFormatErrorReason> = {
  /** The value that isn't valid. */
  readonly value: number;

  /** What's wrong with `value`. */
  readonly reason: R;
};

/**
 * The properties of every error that an `assert*` function throws. `R` is
 * the reasons the error can have, and `P` is the parts of the value it can
 * be about.
 */
type FormatErrorProperties<R extends FormatErrorReason, P extends string> = {
  /** The value that isn't valid. */
  readonly value: string;

  /** What's wrong with `value`. */
  readonly reason: R;

  /** The part of `value` that's wrong. */
  readonly part: P;

  /**
   * Where the problem starts in `value`, as a UTF-16 index like any index
   * of a JavaScript string. The problem is `value.slice(start, end)`.
   */
  readonly start: number;

  /**
   * Where the problem ends in `value`, exclusive. Something that's missing
   * is empty where it would go, with `start` and `end` the same.
   */
  readonly end: number;
};

/** A value isn't a date. {@link assertDate} throws it. */
export class InvalidDateError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing" | "nonexistent-date", "year" | "month" | "day"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing" | "nonexistent-date";
  readonly part: "year" | "month" | "day";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a time. {@link assertTime} throws it. */
export class InvalidTimeError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing", "hour" | "minute" | "second" | "fraction" | "offset" | "offset hour" | "offset minute"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing";
  readonly part: "hour" | "minute" | "second" | "fraction" | "offset" | "offset hour" | "offset minute";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a date-time. {@link assertDateTime} throws it. */
export class InvalidDateTimeError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing" | "nonexistent-date" | "nonexistent-leap-second", "year" | "month" | "day" | "time" | "hour" | "minute" | "second" | "fraction" | "offset" | "offset hour" | "offset minute"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing" | "nonexistent-date" | "nonexistent-leap-second";
  readonly part: "year" | "month" | "day" | "time" | "hour" | "minute" | "second" | "fraction" | "offset" | "offset hour" | "offset minute";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a date-time with an optional time zone and suffix tags. {@link assertDateTimeExt} throws it. */
export class InvalidDateTimeExtError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing" | "too-long" | "nonexistent-date" | "nonexistent-leap-second", "year" | "month" | "day" | "time" | "hour" | "minute" | "second" | "fraction" | "offset" | "offset hour" | "offset minute" | "time zone" | "suffix tag"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing" | "too-long" | "nonexistent-date" | "nonexistent-leap-second";
  readonly part: "year" | "month" | "day" | "time" | "hour" | "minute" | "second" | "fraction" | "offset" | "offset hour" | "offset minute" | "time zone" | "suffix tag";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a duration. {@link assertDuration} throws it. */
export class InvalidDurationError extends Error implements FormatErrorProperties<"invalid-character" | "missing" | "invalid-order", "P" | "T" | "number" | "unit" | "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds"> {
  readonly value: string;
  readonly reason: "invalid-character" | "missing" | "invalid-order";
  readonly part: "P" | "T" | "number" | "unit" | "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an email address. {@link assertEmail} throws it. */
export class InvalidEmailError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing", "local part" | "domain"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing";
  readonly part: "local part" | "domain";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an internationalized email address. {@link assertIdnEmail} throws it. */
export class InvalidIdnEmailError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing" | "invalid-idn", "local part" | "domain"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing" | "invalid-idn";
  readonly part: "local part" | "domain";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a hostname. {@link assertHostname} throws it. */
export class InvalidHostnameError extends Error implements FormatErrorProperties<"invalid-character" | "missing" | "too-long", "hostname"> {
  readonly value: string;
  readonly reason: "invalid-character" | "missing" | "too-long";
  readonly part: "hostname";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an IDNA2008 hostname of A-labels and NR-LDH labels. {@link assertAsciiIdn} throws it. */
export class InvalidAsciiIdnError extends Error implements FormatErrorProperties<"invalid-character" | "missing" | "too-long" | "invalid-idn", "hostname"> {
  readonly value: string;
  readonly reason: "invalid-character" | "missing" | "too-long" | "invalid-idn";
  readonly part: "hostname";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an IDNA2008 internationalized hostname. {@link assertIdn} throws it. */
export class InvalidIdnError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-idn", "hostname"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-idn";
  readonly part: "hostname";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an IPv4 address. {@link assertIPv4} throws it. */
export class InvalidIPv4Error extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing", "octet"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing";
  readonly part: "octet";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an IPv6 address. {@link assertIPv6} throws it. */
export class InvalidIPv6Error extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing", "group" | "octet"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing";
  readonly part: "group" | "octet";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a UUID. {@link assertUuid} throws it. */
export class InvalidUuidError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing", "first group" | "second group" | "third group" | "fourth group" | "fifth group"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing";
  readonly part: "first group" | "second group" | "third group" | "fourth group" | "fifth group";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a URI Template. {@link assertUriTemplate} throws it. */
export class InvalidUriTemplateError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-percent-encoding" | "invalid-value" | "missing", "literals" | "expression"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-percent-encoding" | "invalid-value" | "missing";
  readonly part: "literals" | "expression";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a JSON Pointer. {@link assertJsonPointer} throws it. */
export class InvalidJsonPointerError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-escape", "reference token"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-escape";
  readonly part: "reference token";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a Relative JSON Pointer. {@link assertRelativeJsonPointer} throws it. */
export class InvalidRelativeJsonPointerError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing" | "invalid-escape", "number" | "index manipulation" | "reference token"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing" | "invalid-escape";
  readonly part: "number" | "index manipulation" | "reference token";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an ECMA-262 regular expression. {@link assertRegex} throws it. */
export class InvalidRegexError extends Error implements FormatErrorProperties<"invalid-syntax", "regex"> {
  readonly value: string;
  readonly reason: "invalid-syntax";
  readonly part: "regex";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a date-time without an offset. {@link assertDateTimeLocal} throws it. */
export class InvalidDateTimeLocalError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing" | "nonexistent-date", "year" | "month" | "day" | "time" | "hour" | "minute" | "second" | "fraction"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing" | "nonexistent-date";
  readonly part: "year" | "month" | "day" | "time" | "hour" | "minute" | "second" | "fraction";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a time without an offset. {@link assertTimeLocal} throws it. */
export class InvalidTimeLocalError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing", "hour" | "minute" | "second" | "fraction"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing";
  readonly part: "hour" | "minute" | "second" | "fraction";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an IPv4 address with a prefix length. {@link assertIPv4Cidr} throws it. */
export class InvalidIPv4CidrError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing", "octet" | "prefix length"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing";
  readonly part: "octet" | "prefix length";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an IPv6 address with a prefix length. {@link assertIPv6Cidr} throws it. */
export class InvalidIPv6CidrError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing", "group" | "octet" | "prefix length"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing";
  readonly part: "group" | "octet" | "prefix length";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a well-formed language tag. {@link assertLanguageTag} throws it. */
export class InvalidLanguageTagError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing" | "too-long", "language" | "subtag" | "extension" | "private use"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing" | "too-long";
  readonly part: "language" | "subtag" | "extension" | "private use";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't an HTTP date. {@link assertHttpDate} throws it. */
export class InvalidHttpDateError extends Error implements FormatErrorProperties<"invalid-character" | "invalid-value" | "missing" | "nonexistent-date" | "nonexistent-leap-second" | "wrong-day-name", "day name" | "day" | "month" | "year" | "hour" | "minute" | "second" | "time zone"> {
  readonly value: string;
  readonly reason: "invalid-character" | "invalid-value" | "missing" | "nonexistent-date" | "nonexistent-leap-second" | "wrong-day-name";
  readonly part: "day name" | "day" | "month" | "year" | "hour" | "minute" | "second" | "time zone";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a media range. {@link assertMediaRange} throws it. */
export class InvalidMediaRangeError extends Error implements FormatErrorProperties<"invalid-character" | "missing", "type" | "subtype" | "parameter name" | "parameter value"> {
  readonly value: string;
  readonly reason: "invalid-character" | "missing";
  readonly part: "type" | "subtype" | "parameter name" | "parameter value";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a structured field byte sequence. {@link assertSfBinary} throws it. */
export class InvalidSfBinaryError extends Error implements FormatErrorProperties<"invalid-character" | "missing", "byte sequence"> {
  readonly value: string;
  readonly reason: "invalid-character" | "missing";
  readonly part: "byte sequence";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a structured field boolean. {@link assertSfBoolean} throws it. */
export class InvalidSfBooleanError extends Error implements FormatErrorProperties<"invalid-character" | "missing", "boolean"> {
  readonly value: string;
  readonly reason: "invalid-character" | "missing";
  readonly part: "boolean";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a structured field string. {@link assertSfString} throws it. */
export class InvalidSfStringError extends Error implements FormatErrorProperties<"invalid-character" | "missing" | "invalid-escape", "string"> {
  readonly value: string;
  readonly reason: "invalid-character" | "missing" | "invalid-escape";
  readonly part: "string";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a structured field token. {@link assertSfToken} throws it. */
export class InvalidSfTokenError extends Error implements FormatErrorProperties<"invalid-character" | "missing", "token"> {
  readonly value: string;
  readonly reason: "invalid-character" | "missing";
  readonly part: "token";
  readonly start: number;
  readonly end: number;
  private constructor();
}

/** A value isn't a signed 8-bit integer. {@link assertInt8} throws it. */
export class InvalidInt8Error extends Error implements NumberFormatErrorProperties<"not-an-integer" | "out-of-range"> {
  readonly value: number;
  readonly reason: "not-an-integer" | "out-of-range";
  private constructor();
}

/** A value isn't a signed 16-bit integer. {@link assertInt16} throws it. */
export class InvalidInt16Error extends Error implements NumberFormatErrorProperties<"not-an-integer" | "out-of-range"> {
  readonly value: number;
  readonly reason: "not-an-integer" | "out-of-range";
  private constructor();
}

/** A value isn't a signed 32-bit integer. {@link assertInt32} throws it. */
export class InvalidInt32Error extends Error implements NumberFormatErrorProperties<"not-an-integer" | "out-of-range"> {
  readonly value: number;
  readonly reason: "not-an-integer" | "out-of-range";
  private constructor();
}

/** A value isn't an unsigned 8-bit integer. {@link assertUint8} throws it. */
export class InvalidUint8Error extends Error implements NumberFormatErrorProperties<"not-an-integer" | "out-of-range"> {
  readonly value: number;
  readonly reason: "not-an-integer" | "out-of-range";
  private constructor();
}

/** A value isn't an unsigned 16-bit integer. {@link assertUint16} throws it. */
export class InvalidUint16Error extends Error implements NumberFormatErrorProperties<"not-an-integer" | "out-of-range"> {
  readonly value: number;
  readonly reason: "not-an-integer" | "out-of-range";
  private constructor();
}

/** A value isn't an unsigned 32-bit integer. {@link assertUint32} throws it. */
export class InvalidUint32Error extends Error implements NumberFormatErrorProperties<"not-an-integer" | "out-of-range"> {
  readonly value: number;
  readonly reason: "not-an-integer" | "out-of-range";
  private constructor();
}

/** A value isn't an integer that a double can store without losing precision. {@link assertDoubleInt} throws it. */
export class InvalidDoubleIntError extends Error implements NumberFormatErrorProperties<"not-an-integer" | "out-of-range"> {
  readonly value: number;
  readonly reason: "not-an-integer" | "out-of-range";
  private constructor();
}

/** A value isn't a structured field integer. {@link assertSfInteger} throws it. */
export class InvalidSfIntegerError extends Error implements NumberFormatErrorProperties<"not-an-integer" | "out-of-range"> {
  readonly value: number;
  readonly reason: "not-an-integer" | "out-of-range";
  private constructor();
}

/** A value isn't a structured field decimal. {@link assertSfDecimal} throws it. */
export class InvalidSfDecimalError extends Error implements NumberFormatErrorProperties<"out-of-range" | "too-precise"> {
  readonly value: number;
  readonly reason: "out-of-range" | "too-precise";
  private constructor();
}
