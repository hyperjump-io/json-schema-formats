import { readFile } from "node:fs/promises";
import { describe, test, expect } from "vitest";
import {
  isAsciiIdn,
  isDate,
  isDateTime,
  isDateTimeExt,
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
 *   compatibility?: string;
 *   tags?: string[];
 *   tests: Test[];
 * }} TestCase
 */

/**
 * @typedef {{
 *   description: string;
 *   tests: TestCase[];
 * }} TestSuite
 */

/**
 * The compatibility matching algorithm from the test suite's README. Releases
 * are numbered by draft number or year. 9999 is the unreleased v1 spec.
 *
 * @type (compatibility: string | undefined, release: number) => boolean
 */
const isCompatible = (compatibility, release) => {
  if (compatibility === undefined) {
    return true;
  }

  let isValid = true;
  for (const constraint of compatibility.split(",")) {
    const [, operator, version] = /^(<=|=)?(\d+)$/.exec(constraint) ?? [];
    const constraintRelease = Number(version);

    if (operator === "<=") {
      isValid = release <= constraintRelease;
    } else if (operator === "=") {
      isValid = release === constraintRelease;
    } else {
      isValid = release >= constraintRelease;
    }

    if (release <= constraintRelease) {
      break;
    }
  }

  return isValid;
};

/** @type (format: string, release: number, fn: (value: any) => boolean) => Promise<void> */
export const testSuite = async (format, release, fn) => {
  const testSuiteJson = await readFile(`./node_modules/json-schema-test-suite/validation/tests/${format}.json`, "utf8");
  /** @type TestSuite */
  const testSuite = JSON.parse(testSuiteJson); // eslint-disable-line @typescript-eslint/no-unsafe-assignment

  describe(`${testSuite.description} (${release})`, () => {
    for (const testCase of testSuite.tests) {
      // These functions assert formats. They don't have an annotation-only mode.
      if (!isCompatible(testCase.compatibility, release) || testCase.tags?.includes("format-annotation")) {
        continue;
      }

      describe(testCase.description, () => {
        for (const formatTest of testCase.tests) {
          test(formatTest.description, () => {
            expect(fn(formatTest.data)).to.equal(formatTest.valid);
          });
        }
      });
    }
  });
};

await testSuite("format-date-time", 2020, (dateTime) => typeof dateTime !== "string" || isDateTime(dateTime));
await testSuite("format-date-time", 9999, (dateTime) => typeof dateTime !== "string" || isDateTimeExt(dateTime));
await testSuite("format-date", 2020, (date) => typeof date !== "string" || isDate(date));
await testSuite("format-duration", 2020, (duration) => typeof duration !== "string" || isDuration(duration));
await testSuite("optional/format-regex", 2020, (pattern) => typeof pattern !== "string" || isRegex(pattern));
await testSuite("format-email", 2020, (email) => typeof email !== "string" || isEmail(email));
await testSuite("format-hostname", 9999, (hostname) => typeof hostname !== "string" || isHostname(hostname));
await testSuite("format-hostname", 2020, (hostname) => typeof hostname !== "string" || isAsciiIdn(hostname));
await testSuite("format-idn-email", 2020, (email) => typeof email !== "string" || isIdnEmail(email));
await testSuite("format-idn-hostname", 2020, (hostname) => typeof hostname !== "string" || isIdn(hostname));
await testSuite("format-ipv4", 2020, (ip) => typeof ip !== "string" || isIPv4(ip));
await testSuite("format-ipv6", 2020, (ip) => typeof ip !== "string" || isIPv6(ip));
await testSuite("format-iri-reference", 2020, (iri) => typeof iri !== "string" || isIriReference(iri));
await testSuite("format-iri", 2020, (iri) => typeof iri !== "string" || isIri(iri));
await testSuite("format-json-pointer", 2020, (pointer) => typeof pointer !== "string" || isJsonPointer(pointer));
await testSuite("format-regex", 2020, (pattern) => typeof pattern !== "string" || isRegex(pattern));
await testSuite("format-relative-json-pointer", 2020, (pointer) => typeof pointer !== "string" || isRelativeJsonPointer(pointer));
await testSuite("format-time", 9999, (time) => typeof time !== "string" || isTime(time));
await testSuite("format-uri-reference", 2020, (uri) => typeof uri !== "string" || isUriReference(uri));
await testSuite("format-uri-template", 2020, (uri) => typeof uri !== "string" || isUriTemplate(uri));
await testSuite("format-uri", 2020, (uri) => typeof uri !== "string" || isUri(uri));
await testSuite("format-uuid", 2020, (uuid) => typeof uuid !== "string" || isUuid(uuid));
