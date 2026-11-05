import { describe, test, expect } from "vitest";
import * as Formats from "./index.js";

/**
 * @typedef {{
 *   is: (value: string) => boolean;
 *   assert: (value: string) => void;
 *   error: Function;
 *   format: string;
 *   reasons: string[];
 *   parts: string[];
 *   alphabet: string;
 *   seeds: string[];
 * }} Spec
 */

const dateParts = ["year", "month", "day"];
const timeParts = ["hour", "minute", "second", "fraction", "offset", "offset hour", "offset minute"];

/** @type Record<string, Spec> */
const specs = {
  date: {
    is: Formats.isDate, assert: Formats.assertDate, error: Formats.InvalidDateError, format: "date",
    reasons: ["invalid-character", "invalid-value", "missing", "nonexistent-date"],
    parts: dateParts,
    alphabet: "0123456789-x",
    seeds: ["2020-02-29", "2021-02-28", "2020-12-31", "2020-04-30"]
  },
  time: {
    is: Formats.isTime, assert: Formats.assertTime, error: Formats.InvalidTimeError, format: "time",
    reasons: ["invalid-character", "invalid-value", "missing"],
    parts: timeParts,
    alphabet: "0123456789:Zz+-.x",
    seeds: ["23:59:59Z", "12:00:00.5+05:30", "00:00:00-23:59"]
  },
  dateTime: {
    is: Formats.isDateTime, assert: Formats.assertDateTime, error: Formats.InvalidDateTimeError, format: "date-time",
    reasons: ["invalid-character", "invalid-value", "missing", "nonexistent-date", "nonexistent-leap-second"],
    parts: [...dateParts, "time", ...timeParts],
    alphabet: "0123456789:-TtZz+.",
    seeds: ["2016-12-31T23:59:60Z", "2016-12-31t23:59:60z", "2020-01-01T00:00:00.1+01:00", "2020-02-29T00:00:00Z", "2020-01-01"]
  },
  dateTimeExt: {
    is: Formats.isDateTimeExt, assert: Formats.assertDateTimeExt, error: Formats.InvalidDateTimeExtError, format: "date-time",
    reasons: ["invalid-character", "invalid-value", "missing", "too-long", "nonexistent-date", "nonexistent-leap-second"],
    parts: [...dateParts, "time", ...timeParts, "time zone", "suffix tag"],
    alphabet: "[]!/._+-=aZz0129:",
    seeds: [
      "2020-01-01T00:00:00Z[America/New_York]",
      "2020-01-01T00:00:00Z[!.a][u-ca=greg-x]",
      "2020-01-01T00:00:00Z[.../a]",
      "2020-01-01T00:00:00Z[+01:00][_a=b]",
      "2020-01-01T00:00:00Z[abcdefghijklmn]",
      "2016-12-31T23:59:60Z[a]",
      "2020-02-29T00:00:00Z[a]",
      "2020-01-01"
    ]
  },
  duration: {
    is: Formats.isDuration, assert: Formats.assertDuration, error: Formats.InvalidDurationError, format: "duration",
    reasons: ["invalid-character", "missing", "invalid-order"],
    parts: ["P", "T", "number", "unit", "years", "months", "weeks", "days", "hours", "minutes", "seconds"],
    alphabet: "PTYMWDHS0123456789pdx",
    seeds: ["P1Y2M3DT4H5M6S", "P1W", "PT1M", "P1M2D", "PT1H2M", "P1D"]
  },
  email: {
    is: Formats.isEmail, assert: Formats.assertEmail, error: Formats.InvalidEmailError, format: "email",
    reasons: ["invalid-character", "invalid-value", "missing"],
    parts: ["local part", "domain"],
    alphabet: "a1\".@[]:\\ -_é.:I6",
    seeds: ["a@b.c", "\"a b\"@c", "a.b@c-d.e", "a@[1.2.3.4]", "a@[IPv6:::1]", "a@[ipv6:1::]", "\"a\\\"\"@b"]
  },
  idnEmail: {
    is: Formats.isIdnEmail, assert: Formats.assertIdnEmail, error: Formats.InvalidIdnEmailError, format: "idn-email",
    reasons: ["invalid-character", "invalid-value", "missing", "invalid-idn"],
    parts: ["local part", "domain"],
    alphabet: "a1\".@[]:\\ -_é 。x",
    seeds: ["é@é.com", "a@[IPv6:::1]", "a@[x:y]", "\"é\"@b.c", "a@xn--bcher-kva.ch", "a@[1.2.3.4]"]
  },
  hostname: {
    is: Formats.isHostname, assert: Formats.assertHostname, error: Formats.InvalidHostnameError, format: "hostname",
    reasons: ["invalid-character", "missing", "too-long"],
    parts: ["hostname"],
    alphabet: "aZ09-._",
    seeds: ["a-b.c", "a.b", "a".repeat(63), `${"a".repeat(63)}.`.repeat(3) + "a".repeat(63)]
  },
  asciiIdn: {
    is: Formats.isAsciiIdn, assert: Formats.assertAsciiIdn, error: Formats.InvalidAsciiIdnError, format: "hostname",
    reasons: ["invalid-character", "missing", "too-long", "invalid-idn"],
    parts: ["hostname"],
    alphabet: "aZ09-._x",
    seeds: ["xn--bcher-kva.ch", "a.b", "a-b", "a".repeat(63), `${"a".repeat(63)}.`.repeat(3) + "a".repeat(63)]
  },
  idn: {
    is: Formats.isIdn, assert: Formats.assertIdn, error: Formats.InvalidIdnError, format: "idn-hostname",
    reasons: ["invalid-character", "invalid-idn"],
    parts: ["hostname"],
    alphabet: "aé-._。̀",
    seeds: ["bücher.ch", "日本.jp", "a.b"]
  },
  ipv4: {
    is: Formats.isIPv4, assert: Formats.assertIPv4, error: Formats.InvalidIPv4Error, format: "ipv4",
    reasons: ["invalid-character", "invalid-value", "missing"],
    parts: ["octet"],
    alphabet: "0123456789.a",
    seeds: ["192.168.0.1", "255.255.255.255", "0.0.0.0"]
  },
  ipv6: {
    is: Formats.isIPv6, assert: Formats.assertIPv6, error: Formats.InvalidIPv6Error, format: "ipv6",
    reasons: ["invalid-character", "invalid-value", "missing"],
    parts: ["group", "octet"],
    alphabet: "019afAF:.g",
    seeds: ["::1", "1:2:3:4:5:6:7:8", "::ffff:1.2.3.4", "1::", "1:2:3:4:5:6:1.2.3.4", "1::2:3"]
  },
  uuid: {
    is: Formats.isUuid, assert: Formats.assertUuid, error: Formats.InvalidUuidError, format: "uuid",
    reasons: ["invalid-character", "invalid-value", "missing"],
    parts: ["first group", "second group", "third group", "fourth group", "fifth group"],
    alphabet: "09afAFg-",
    seeds: ["2eb8aa08-aa98-11ea-b4aa-73b441d16380"]
  },
  uriTemplate: {
    is: Formats.isUriTemplate, assert: Formats.assertUriTemplate, error: Formats.InvalidUriTemplateError, format: "uri-template",
    reasons: ["invalid-character", "invalid-percent-encoding", "invalid-value", "missing"],
    parts: ["literals", "expression"],
    alphabet: "{}+#./;?&=,!@|:*a_%0F9'<  ",
    seeds: ["a{+b,c:3}d", "{x*}", "%20{a.b}", "{a.b.c:9999}"]
  },
  jsonPointer: {
    is: Formats.isJsonPointer, assert: Formats.assertJsonPointer, error: Formats.InvalidJsonPointerError, format: "json-pointer",
    reasons: ["invalid-character", "invalid-escape"],
    parts: ["reference token"],
    alphabet: "/~01a\u007F\uD800",
    seeds: ["/a/~0/~1", "", "/"]
  },
  relativeJsonPointer: {
    is: Formats.isRelativeJsonPointer, assert: Formats.assertRelativeJsonPointer, error: Formats.InvalidRelativeJsonPointerError, format: "relative-json-pointer",
    reasons: ["invalid-character", "invalid-value", "missing", "invalid-escape"],
    parts: ["number", "index manipulation", "reference token"],
    alphabet: "/~0123+-#a",
    seeds: ["0/a", "1#", "2+3/a", "10-1/~0"]
  },
  regex: {
    is: Formats.isRegex, assert: Formats.assertRegex, error: Formats.InvalidRegexError, format: "regex",
    reasons: ["invalid-syntax"],
    parts: ["regex"],
    alphabet: "()[]{}a\\-?*+|^$,1",
    seeds: ["(a)", "[a-z]+", "a{1,2}", "\\d"]
  }
};

// mulberry32, so every run tests the same values
/** @type (seed: number) => (n: number) => number */
const random = (seed) => {
  let state = seed;
  return (n) => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
  };
};

/** @type (spec: Spec, count: number) => Set<string> */
const valuesFor = (spec, count) => {
  const next = random(42);
  const alphabet = Array.from(spec.alphabet);
  const values = new Set(spec.seeds);

  while (values.size < count) {
    if (next(4) === 0) {
      let value = "";
      for (let length = next(16); length > 0; length--) {
        value += alphabet[next(alphabet.length)];
      }
      values.add(value);
    } else {
      const chars = Array.from(spec.seeds[next(spec.seeds.length)]);
      for (let edits = 1 + next(3); edits > 0; edits--) {
        const position = next(chars.length + 1);
        const char = alphabet[next(alphabet.length)];
        const edit = next(3);
        if (edit === 0) {
          chars.splice(position, 0, char);
        } else if (edit === 1) {
          chars.splice(position, 1);
        } else {
          chars[position] = char;
        }
      }
      values.add(chars.join(""));
    }
  }

  return values;
};

/** @type (fn: () => unknown) => unknown */
const thrown = (fn) => {
  try {
    fn();
  } catch (error) {
    return error;
  }
};

/**
 * What's wrong with what `assert*` did for `value`, if anything, and the error it threw for an invalid value.
 *
 * @type (spec: Spec, value: string) => { failure?: string, error?: any }
 */
const check = (spec, value) => {
  /** @type boolean | undefined */
  let valid;
  const isError = thrown(() => {
    valid = spec.is(value);
  });
  const error = /** @type any */ (thrown(() => spec.assert(value)));

  if (isError !== undefined) {
    // A validator that throws, like isEmail for an unknown address literal tag, throws the same from assert*
    const same = error instanceof Error && isError instanceof Error && error.message === isError.message;
    return same ? {} : { failure: "throws something else than the validator" };
  } else if (valid) {
    return error === undefined ? {} : { failure: `throws for a valid value: ${String(error)}` };
  } else if (Object.getPrototypeOf(error) !== spec.error.prototype || error.name !== spec.error.name) {
    return { failure: `throws ${String(error)}` };
  } else if (error.value !== value) {
    return { failure: "has the wrong value" };
  } else if (!spec.reasons.includes(error.reason)) {
    return { failure: `has an undeclared reason: ${error.reason}` };
  } else if (!spec.parts.includes(error.part)) {
    return { failure: `has an undeclared part: ${error.part}` };
  } else if (!(error.start >= 0 && error.start <= error.end && error.end <= value.length)) {
    return { failure: `has a span outside the value: ${error.start}-${error.end}` };
  } else if (!error.message.startsWith(`Invalid ${spec.format}: ${value} — `)) {
    return { failure: `has the wrong message: ${error.message}` };
  }

  return { error };
};

describe("assert* throws exactly when is* is false", () => {
  for (const [name, spec] of Object.entries(specs)) {
    test(name, () => {
      const failures = [];
      const reasons = new Set(spec.reasons);
      const parts = new Set(spec.parts);

      for (const value of valuesFor(spec, 10_000)) {
        const { failure, error } = check(spec, value);
        if (failure !== undefined) {
          failures.push([value, failure]);
        } else if (error !== undefined) {
          reasons.delete(error.reason);
          parts.delete(error.part);
        }
      }

      expect(failures.slice(0, 10)).to.deep.equal([]);
      // Every reason and part that's declared comes up, so the values reach all of the diagnosis
      expect([...reasons], "reasons that didn't come up").to.deep.equal([]);
      expect([...parts], "parts that didn't come up").to.deep.equal([]);
    });
  }
});

describe("What's wrong and where", () => {
  test.each([
    [Formats.assertDate, "2020-13-01", { reason: "invalid-value", part: "month", start: 5, end: 7, message: "Invalid date: 2020-13-01 — the month must be 01-12, at 5" }],
    [Formats.assertDate, "2020-01", { reason: "missing", part: "day", start: 7, end: 7, message: "Invalid date: 2020-01 — it has no day, at 7" }],
    [Formats.assertDate, "2021-02-29", { reason: "nonexistent-date", part: "day", start: 8, end: 10, message: "Invalid date: 2021-02-29 — 2021-02 has 28 days, at 8" }],
    [Formats.assertDate, "2020/01/01", { reason: "invalid-character", part: "year", start: 4, end: 5, message: `Invalid date: 2020/01/01 — "/" isn't allowed after the year, at 4; it must be "-"` }],
    [Formats.assertTime, "23:59:60Z", { reason: "invalid-value", part: "second", start: 6, end: 8, message: "Invalid time: 23:59:60Z — the second must be 00-59, at 6; a leap second can't be checked without a date" }],
    [Formats.assertTime, "12:00:00", { reason: "missing", part: "offset", start: 8, end: 8 }],
    [Formats.assertTime, "12:00:00.Z", { reason: "missing", part: "fraction", start: 9, end: 9, message: `Invalid time: 12:00:00.Z — it has no digits after ".", at 9` }],
    [Formats.assertDateTime, "2017-12-31T23:59:60Z", { reason: "nonexistent-leap-second", part: "second", start: 17, end: 19, message: "Invalid date-time: 2017-12-31T23:59:60Z — there was no leap second then, at 17; a leap second is at 23:59:60 UTC, on a day that had one" }],
    [Formats.assertDateTime, "2020-01-01 00:00:00Z", { reason: "invalid-character", part: "day", start: 10, end: 11 }],
    [Formats.assertDateTimeExt, "2020-01-01T00:00:00Z[..]", { reason: "invalid-value", part: "time zone", start: 21, end: 23, message: `Invalid date-time: 2020-01-01T00:00:00Z[..] — a time zone name's part can't be "..", at 21` }],
    [Formats.assertDateTimeExt, "2020-01-01T00:00:00Z[a][b]", { reason: "invalid-value", part: "suffix tag", start: 23, end: 26 }],
    [Formats.assertDateTimeExt, "2020-01-01T00:00:00Z[U-ca=x]", { reason: "invalid-character", part: "suffix tag", start: 21, end: 22 }],
    [Formats.assertDuration, "P1D2H", { reason: "invalid-order", part: "hours", start: 4, end: 5, message: `Invalid duration: P1D2H — hours must come after "T", at 4` }],
    [Formats.assertDuration, "P1Y1D", { reason: "invalid-order", part: "days", start: 4, end: 5, message: "Invalid duration: P1Y1D — days can't come after years without months between them, at 4" }],
    [Formats.assertDuration, "P1W1D", { reason: "invalid-order", part: "days", start: 4, end: 5 }],
    [Formats.assertDuration, "P1YT", { reason: "missing", part: "unit", start: 4, end: 4, message: `Invalid duration: P1YT — it has no units after "T", at 4` }],
    [Formats.assertEmail, "a b@c.com", { reason: "invalid-character", part: "local part", start: 1, end: 2, message: `Invalid email: a b@c.com — " " isn't allowed in the local part, at 1` }],
    [Formats.assertEmail, "é@c.com", { reason: "invalid-character", part: "local part", start: 0, end: 1, message: `Invalid email: é@c.com — "é" isn't allowed in the local part, at 0; it's allowed in an idn-email` }],
    [Formats.assertEmail, "a..b@c", { reason: "invalid-character", part: "local part", start: 2, end: 3 }],
    [Formats.assertEmail, "a@b-.c", { reason: "invalid-character", part: "domain", start: 3, end: 4 }],
    [Formats.assertEmail, "a@[1.2.3.256]", { reason: "invalid-value", part: "domain", start: 9, end: 12, message: "Invalid email: a@[1.2.3.256] — the fourth octet must be 0-255, at 9" }],
    [Formats.assertEmail, "a@[IPv6:1::2::3]", { reason: "invalid-value", part: "domain", start: 12, end: 14, message: `Invalid email: a@[IPv6:1::2::3] — "::" can only be used once, at 12` }],
    [Formats.assertEmail, "a@[ipv6:zz]", { reason: "invalid-character", part: "domain", start: 8, end: 9 }],
    [Formats.assertIdnEmail, "a@[ipv6:zz]", { reason: "invalid-character", part: "domain", start: 8, end: 9 }],
    [Formats.assertIdnEmail, "a@xn--a.com", { reason: "invalid-idn", part: "domain", start: 2, end: 11 }],
    [Formats.assertHostname, "a".repeat(64), { reason: "too-long", part: "hostname", start: 63, end: 64 }],
    [Formats.assertHostname, "-a", { reason: "invalid-character", part: "hostname", start: 0, end: 1, message: `Invalid hostname: -a — "-" isn't allowed at the start of a label, at 0` }],
    [Formats.assertIdn, "a.", { reason: "invalid-character", part: "hostname", start: 1, end: 2 }],
    [Formats.assertIPv4, "256.1.1.1", { reason: "invalid-value", part: "octet", start: 0, end: 3, message: "Invalid ipv4: 256.1.1.1 — the first octet must be 0-255, at 0" }],
    [Formats.assertIPv4, "1.2.3", { reason: "missing", part: "octet", start: 5, end: 5 }],
    [Formats.assertIPv6, "1::2::3", { reason: "invalid-value", part: "group", start: 4, end: 6, message: `Invalid ipv6: 1::2::3 — "::" can only be used once, at 4` }],
    [Formats.assertIPv6, "12345::", { reason: "invalid-value", part: "group", start: 0, end: 5 }],
    [Formats.assertIPv6, "::1.2.3.256", { reason: "invalid-value", part: "octet", start: 8, end: 11 }],
    [Formats.assertUuid, "2eb8aa08-aa98-11ea-b4aa-73b441d1638", { reason: "invalid-value", part: "fifth group", start: 24, end: 35, message: "Invalid uuid: 2eb8aa08-aa98-11ea-b4aa-73b441d1638 — the fifth group must be 12 hex digits, at 24" }],
    [Formats.assertUriTemplate, "a{b", { reason: "missing", part: "expression", start: 3, end: 3, message: `Invalid uri-template: a{b — it has no "}", at 3` }],
    [Formats.assertUriTemplate, "%zz", { reason: "invalid-percent-encoding", part: "literals", start: 0, end: 3 }],
    [Formats.assertUriTemplate, "{a:10000}", { reason: "invalid-value", part: "expression", start: 3, end: 8 }],
    [Formats.assertJsonPointer, "/a~2", { reason: "invalid-escape", part: "reference token", start: 2, end: 4, message: `Invalid json-pointer: /a~2 — "~" must be followed by "0" or "1", at 2` }],
    [Formats.assertRelativeJsonPointer, "01/a", { reason: "invalid-value", part: "number", start: 0, end: 2 }],
    [Formats.assertRelativeJsonPointer, "0+1#", { reason: "invalid-character", part: "index manipulation", start: 3, end: 4 }],
    [Formats.assertRegex, "(", { reason: "invalid-syntax", part: "regex", start: 0, end: 1, message: "Invalid regex: ( — Unterminated group" }]
  ])("%o %s", (assert, value, expected) => {
    expect(thrown(() => assert(value))).to.include(expected);
  });

  test("an invisible character is written as its code point", () => {
    expect(thrown(() => Formats.assertEmail("a b@c"))).to.include({
      message: "Invalid email: a b@c — U+00A0 isn't allowed in the local part, at 1; it's allowed in an idn-email"
    });
  });
});

describe("URIs and IRIs, from @hyperjump/uri", () => {
  test("assert* throws its errors", () => {
    expect(thrown(() => Formats.assertUri("http://exa mple.com"))).to.be.instanceOf(Formats.InvalidUriError);
    expect(thrown(() => Formats.assertUriReference("1a:b"))).to.be.instanceOf(Formats.InvalidUriError);
    expect(thrown(() => Formats.assertIri("http://exa mple.com"))).to.be.instanceOf(Formats.InvalidIriError);
    expect(thrown(() => Formats.assertIriReference("http://exa mple.com"))).to.be.instanceOf(Formats.InvalidIriError);
    expect(Formats.assertIri("http://examplé.com")).to.equal(undefined);
  });

  test("a scheme or URN namespace that isn't known throws", () => {
    expect(thrown(() => Formats.isUri("ftp://example.com"))).to.be.instanceOf(Formats.UnknownSchemeError);
    expect(thrown(() => Formats.isUri("urn:isbn:0451450523"))).to.be.instanceOf(Formats.UnknownUrnNamespaceError);
    expect(thrown(() => Formats.isUri("http://[v7.future]/"))).to.be.instanceOf(Formats.UnsupportedIpVersionError);
  });
});
