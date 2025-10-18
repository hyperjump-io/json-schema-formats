import { readFile } from "node:fs/promises";
import { describe, test, expect } from "vitest";
import { isDate, isDateTime, isDuration, isTime } from "./rfc3339.js";
import { isRegex } from "./ecma262.js";
import { isEmail } from "./rfc5321.js";
import { isHostname } from "./rfc1123.js";
import { isAsciiIdn, isIdn } from "./idna2008.js";
import { isIdnEmail } from "./rfc6531.js";
import { isIPv4 } from "./rfc2673.js";
import { isIPv6 } from "./rfc4291.js";
import { isIriReference } from "./rfc3987.js";
import { isJsonPointer } from "./rfc6901.js";
import { isRelativeJsonPointer } from "./draft-bhutton-relative-json-pointer-00.js";
import { isUri, isUriReference } from "./rfc3986.js";
import { isUriTemplate } from "./rfc6570.js";
import { isUuid } from "./rfc4122.js";

/**
 * @typedef {{
 *   description: string;
 *   data: unknown;
 *   valid: boolean;
 * }} Test
 */

/**
 * @typedef {{
 *   description: string;
 *   tests: Test[];
 * }} TestCase
 */

/**
 * @typedef {TestCase[]} TestSuite
 */

/** @type (format: string, fn: (value: any) => boolean, skip?: Record<string, Set<string>>) => Promise<void> */
export const testSuite = async (format, fn, skip = {}) => {
  const testSuiteJson = await readFile(`./node_modules/json-schema-test-suite/tests/${format}.json`, "utf8");
  /** @type TestSuite */
  const testSuite = JSON.parse(testSuiteJson); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

  for (const testCase of testSuite) {
    describe(testCase.description, () => {
      for (const formatTest of testCase.tests) {
        if (skip[testCase.description]?.has(formatTest.description)) {
          continue;
        }

        test(formatTest.description, () => {
          expect(fn(formatTest.data)).to.equal(formatTest.valid);
        });
      }
    });
  }
};

await testSuite("draft2020-12/optional/format/date-time", (dateTime) => typeof dateTime !== "string" || isDateTime(dateTime));
await testSuite("draft2020-12/optional/format/date", (date) => typeof date !== "string" || isDate(date));
await testSuite("draft2020-12/optional/format/duration", (duration) => typeof duration !== "string" || isDuration(duration));
await testSuite("draft2020-12/optional/format/ecmascript-regex", (pattern) => typeof pattern !== "string" || isRegex(pattern));
await testSuite("draft2020-12/optional/format/email", (email) => typeof email !== "string" || isEmail(email));
await testSuite("draft6/optional/format/hostname", (hostname) => typeof hostname !== "string" || isHostname(hostname));
await testSuite("draft2020-12/optional/format/hostname", (hostname) => typeof hostname !== "string" || isAsciiIdn(hostname));
await testSuite("draft2020-12/optional/format/idn-email", (email) => typeof email !== "string" || isIdnEmail(email));
await testSuite("draft2020-12/optional/format/idn-hostname", (hostname) => typeof hostname !== "string" || isIdn(hostname), {
  "validation of internationalized host names": new Set([
    "contains illegal char U+302E Hangul single dot tone mark",
    "Exceptions that are DISALLOWED, right-to-left chars",
    "Exceptions that are DISALLOWED, left-to-right chars",
    "MIDDLE DOT with no preceding 'l'",
    "MIDDLE DOT with nothing preceding",
    "MIDDLE DOT with no following 'l'",
    "MIDDLE DOT with nothing following",
    "Greek KERAIA not followed by Greek",
    "Greek KERAIA not followed by anything",
    "Hebrew GERESH not preceded by anything",
    "Hebrew GERSHAYIM not preceded by anything",
    "KATAKANA MIDDLE DOT with no Hiragana, Katakana, or Han",
    "KATAKANA MIDDLE DOT with no other characters"
  ])
});
await testSuite("draft2020-12/optional/format/ipv4", (ip) => typeof ip !== "string" || isIPv4(ip));
await testSuite("draft2020-12/optional/format/ipv6", (ip) => typeof ip !== "string" || isIPv6(ip));
await testSuite("draft2020-12/optional/format/iri-reference", (iri) => typeof iri !== "string" || isIriReference(iri));
await testSuite("draft2020-12/optional/format/json-pointer", (pointer) => typeof pointer !== "string" || isJsonPointer(pointer));
await testSuite("draft2020-12/optional/format/regex", (pattern) => typeof pattern !== "string" || isRegex(pattern));
await testSuite("draft2020-12/optional/format/relative-json-pointer", (pointer) => typeof pointer !== "string" || isRelativeJsonPointer(pointer));
await testSuite("draft2020-12/optional/format/time", (time) => typeof time !== "string" || isTime(time), {
  "validation of time strings": new Set([
    "a valid time string with leap second, Zulu",
    "valid leap second, zero time-offset",
    "valid leap second, positive time-offset",
    "valid leap second, large positive time-offset",
    "valid leap second, negative time-offset",
    "valid leap second, large negative time-offset"
  ])
});
await testSuite("draft2020-12/optional/format/uri-reference", (uri) => typeof uri !== "string" || isUriReference(uri));
await testSuite("draft2020-12/optional/format/uri-template", (uri) => typeof uri !== "string" || isUriTemplate(uri));
await testSuite("draft2020-12/optional/format/uri", (uri) => typeof uri !== "string" || isUri(uri));
await testSuite("draft2020-12/optional/format/uuid", (uuid) => typeof uuid !== "string" || isUuid(uuid));
