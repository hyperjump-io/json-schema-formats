import { readFile } from "node:fs/promises";
import { describe, test, expect } from "vitest";
import {
  isAsciiIdn,
  isDate,
  isDateTime,
  isDuration,
  isEmail,
  isHostname,
  isIdn,
  isIdnEmail,
  isIPv4,
  isIPv6,
  isIri,
  isIriReference,
  isJsonPointer,
  isRegex,
  isRelativeJsonPointer,
  isTime,
  isUri,
  isUriReference,
  isUriTemplate,
  isUuid
} from "./index.js";

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
await testSuite("draft2020-12/optional/format/idn-hostname", (hostname) => typeof hostname !== "string" || isIdn(hostname));
await testSuite("draft2020-12/optional/format/ipv4", (ip) => typeof ip !== "string" || isIPv4(ip));
await testSuite("draft2020-12/optional/format/ipv6", (ip) => typeof ip !== "string" || isIPv6(ip));
await testSuite("draft2020-12/optional/format/iri-reference", (iri) => typeof iri !== "string" || isIriReference(iri));
await testSuite("draft2020-12/optional/format/iri", (iri) => typeof iri !== "string" || isIri(iri));
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
