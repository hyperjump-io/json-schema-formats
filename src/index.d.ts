import type { Iri, IriReference, Options, Uri, UriReference } from "@hyperjump/uri";

export type { Iri, IriReference, Options, Uri, UriReference } from "@hyperjump/uri";
export {
  InvalidUriError, InvalidIriError, UnknownSchemeError, UnknownUrnNamespaceError, UnsupportedIpVersionError
} from "@hyperjump/uri";

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
 * The 'date-time' format since v1. Validates that a string represents a
 * date-time with an optional time zone and suffix tags according to the
 * "date-time-ext" rule in [RFC 9557, section 4.1](https://www.rfc-editor.org/rfc/rfc9557.html#section-4.1).
 *
 * **NOTE**: Validation is syntactic only. Time zone names are not checked
 * against the IANA Time Zone Database and the offset is not checked for
 * consistency with the time zone. Use {@link isDateTime} for draft2020-12 and
 * earlier.
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
 * @see [JSON Schema Core, section 7.3.2](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.2)
 */
export const isEmail: (email: string) => boolean;

/**
 * Checks that `email` is an email address, like {@link isEmail}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidEmailError} If `email` isn't an email address.
 *
 * @throws {Error} If the address literal has a tag that isn't known, like {@link isEmail}.
 */
export const assertEmail: (email: string) => void;

/**
 * The 'idn-email' format. Validates that a string represents an email as
 * defined by the "Mailbox" ABNF rule in [RFC 6531, section 3.3](https://www.rfc-editor.org/rfc/rfc6531.html#section-3.3).
 *
 * @see [JSON Schema Core, section 7.3.2](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.2)
 */
export const isIdnEmail: (email: string) => boolean;

/**
 * Checks that `email` is an internationalized email address, like {@link isIdnEmail}, and throws an error
 * that says what's wrong and where if it isn't.
 *
 * @throws {InvalidIdnEmailError} If `email` isn't an internationalized email address.
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
 * **NOTE**: A URI of a scheme that isn't known can't be validated, so it
 * throws. `@hyperjump/uri` knows `http`, `https`, `file`, `tag`, and `urn`
 * (with the `uuid` namespace). Pass others in `customSchemes`.
 *
 * @throws {UnknownSchemeError} If the scheme isn't known.
 * @throws {UnknownUrnNamespaceError} If it's a URN of a namespace that isn't
 *   known.
 * @throws {UnsupportedIpVersionError} If the host is an IP literal of a
 *   future version.
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isUri: (uri: string, options?: Options) => uri is Uri;

/**
 * Checks that `uri` is a URI, like {@link isUri}, and throws an error that
 * says what's wrong and where if it isn't.
 *
 * @throws {InvalidUriError} If `uri` isn't a URI.
 * @throws {UnknownSchemeError} If the scheme isn't known.
 * @throws {UnknownUrnNamespaceError} If it's a URN of a namespace that isn't
 *   known.
 * @throws {UnsupportedIpVersionError} If the host is an IP literal of a
 *   future version.
 */
export const assertUri: (uri: string, options?: Options) => asserts uri is Uri;

/**
 * The 'uri-reference' format. Validates that a string represents a URI
 * Reference as defined by [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html),
 * with the rules of its scheme if it has one, like {@link isUri}.
 *
 * @throws {UnknownSchemeError} If it has a scheme that isn't known.
 * @throws {UnknownUrnNamespaceError} If it's a URN of a namespace that isn't
 *   known.
 * @throws {UnsupportedIpVersionError} If the host is an IP literal of a
 *   future version.
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isUriReference: (uri: string, options?: Options) => uri is UriReference;

/**
 * Checks that `uri` is a URI Reference, like {@link isUriReference}.
 *
 * @throws {InvalidUriError} If `uri` isn't a URI Reference.
 * @throws {UnknownSchemeError} If it has a scheme that isn't known.
 * @throws {UnknownUrnNamespaceError} If it's a URN of a namespace that isn't
 *   known.
 * @throws {UnsupportedIpVersionError} If the host is an IP literal of a
 *   future version.
 */
export const assertUriReference: (uri: string, options?: Options) => asserts uri is UriReference;

/**
 * The 'iri' format. Validates that a string represents an IRI as defined by
 * [RFC 3987](https://www.rfc-editor.org/rfc/rfc3987.html), with the rules of
 * its scheme, like {@link isUri}.
 *
 * @throws {UnknownSchemeError} If the scheme isn't known.
 * @throws {UnknownUrnNamespaceError} If it's a URN of a namespace that isn't
 *   known.
 * @throws {UnsupportedIpVersionError} If the host is an IP literal of a
 *   future version.
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isIri: (iri: string, options?: Options) => iri is Iri;

/**
 * Checks that `iri` is an IRI, like {@link isIri}.
 *
 * @throws {InvalidIriError} If `iri` isn't an IRI.
 * @throws {UnknownSchemeError} If the scheme isn't known.
 * @throws {UnknownUrnNamespaceError} If it's a URN of a namespace that isn't
 *   known.
 * @throws {UnsupportedIpVersionError} If the host is an IP literal of a
 *   future version.
 */
export const assertIri: (iri: string, options?: Options) => asserts iri is Iri;

/**
 * The 'iri-reference' format. Validates that a string represents an IRI
 * Reference as defined by [RFC 3987](https://www.rfc-editor.org/rfc/rfc3987.html),
 * with the rules of its scheme if it has one, like {@link isUri}.
 *
 * @throws {UnknownSchemeError} If it has a scheme that isn't known.
 * @throws {UnknownUrnNamespaceError} If it's a URN of a namespace that isn't
 *   known.
 * @throws {UnsupportedIpVersionError} If the host is an IP literal of a
 *   future version.
 * @see [JSON Schema Core, section 7.3.5](https://json-schema.org/draft/2020-12/draft-bhutton-json-schema-validation-01#section-7.3.5)
 */
export const isIriReference: (iri: string, options?: Options) => iri is IriReference;

/**
 * Checks that `iri` is an IRI Reference, like {@link isIriReference}.
 *
 * @throws {InvalidIriError} If `iri` isn't an IRI Reference.
 * @throws {UnknownSchemeError} If it has a scheme that isn't known.
 * @throws {UnknownUrnNamespaceError} If it's a URN of a namespace that isn't
 *   known.
 * @throws {UnsupportedIpVersionError} If the host is an IP literal of a
 *   future version.
 */
export const assertIriReference: (iri: string, options?: Options) => asserts iri is IriReference;

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
 * What's wrong with a value. Each error has the reasons that it can have.
 *
 * - `invalid-character`: a character isn't allowed where it is.
 * - `invalid-value`: a part has the right characters, but isn't one of the
 *   values it can be, like a month of `13`.
 * - `missing`: a part isn't there. The span is empty, where it would be.
 * - `too-long`: a part has more characters than it can. The span is the
 *   characters past the limit.
 * - `invalid-order`: a duration's units aren't in the order they have to be.
 * - `invalid-escape`: a JSON Pointer's `~` isn't followed by `0` or `1`.
 * - `invalid-percent-encoding`: a `%` isn't followed by two hex digits.
 * - `nonexistent-date`: the day isn't in the month, like `2021-02-29`.
 * - `nonexistent-leap-second`: there wasn't a leap second at that time.
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
    | "invalid-idn"
    | "invalid-syntax";

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
