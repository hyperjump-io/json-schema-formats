import { readFile } from "node:fs/promises";
import { describe, test, expect } from "vitest";
import {
  isAsciiIdn,
  isDate,
  isDateTime,
  isDateTimeExt,
  isDateTimeLocal,
  isDuration,
  isEmail,
  isHostname,
  isHttpDate,
  isIdn,
  isIdnEmail,
  isIPv4,
  isIPv6,
  isIri,
  isIriReference,
  isJsonPointer,
  isMediaRange,
  isRegex,
  isRelativeJsonPointer,
  isSfBinary,
  isSfBoolean,
  isSfString,
  isSfToken,
  isTime,
  isTimeLocal,
  isUri,
  isUriReference,
  isUriTemplate,
  isUuid
} from "./index.js";

// The JSON Schema Test Suite, and this package's tests in its format, for what the suite doesn't have. They're in the
// suite's format so they can be given to it.
const jsonSchemaTestSuite = "./node_modules/json-schema-test-suite/validation/tests";
const ours = "./test-suite/tests";

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

/** @type (directory: string, format: string, release: number, fn: (value: any) => boolean) => Promise<void> */
export const testSuite = async (directory, format, release, fn) => {
  const testSuiteJson = await readFile(`${directory}/${format}.json`, "utf8");
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

await testSuite(jsonSchemaTestSuite, "format-date-time", 2020, (dateTime) => typeof dateTime !== "string" || isDateTime(dateTime));
await testSuite(jsonSchemaTestSuite, "format-date-time", 9999, (dateTime) => typeof dateTime !== "string" || isDateTimeExt(dateTime));
await testSuite(jsonSchemaTestSuite, "format-date", 2020, (date) => typeof date !== "string" || isDate(date));
await testSuite(jsonSchemaTestSuite, "format-duration", 2020, (duration) => typeof duration !== "string" || isDuration(duration));
await testSuite(jsonSchemaTestSuite, "optional/format-regex", 2020, (pattern) => typeof pattern !== "string" || isRegex(pattern));
await testSuite(jsonSchemaTestSuite, "format-email", 2020, (email) => typeof email !== "string" || isEmail(email));
await testSuite(jsonSchemaTestSuite, "format-hostname", 9999, (hostname) => typeof hostname !== "string" || isHostname(hostname));
await testSuite(jsonSchemaTestSuite, "format-hostname", 2020, (hostname) => typeof hostname !== "string" || isAsciiIdn(hostname));
await testSuite(jsonSchemaTestSuite, "format-idn-email", 2020, (email) => typeof email !== "string" || isIdnEmail(email));
await testSuite(jsonSchemaTestSuite, "format-idn-hostname", 2020, (hostname) => typeof hostname !== "string" || isIdn(hostname));
await testSuite(jsonSchemaTestSuite, "format-ipv4", 2020, (ip) => typeof ip !== "string" || isIPv4(ip));
await testSuite(jsonSchemaTestSuite, "format-ipv6", 2020, (ip) => typeof ip !== "string" || isIPv6(ip));
await testSuite(jsonSchemaTestSuite, "format-iri-reference", 2020, (iri) => typeof iri !== "string" || isIriReference(iri));
await testSuite(jsonSchemaTestSuite, "format-iri", 2020, (iri) => typeof iri !== "string" || isIri(iri));
await testSuite(jsonSchemaTestSuite, "format-json-pointer", 2020, (pointer) => typeof pointer !== "string" || isJsonPointer(pointer));
await testSuite(jsonSchemaTestSuite, "format-regex", 2020, (pattern) => typeof pattern !== "string" || isRegex(pattern));
await testSuite(jsonSchemaTestSuite, "format-relative-json-pointer", 2020, (pointer) => typeof pointer !== "string" || isRelativeJsonPointer(pointer));
await testSuite(jsonSchemaTestSuite, "format-time", 9999, (time) => typeof time !== "string" || isTime(time));
await testSuite(jsonSchemaTestSuite, "format-uri-reference", 2020, (uri) => typeof uri !== "string" || isUriReference(uri));
await testSuite(jsonSchemaTestSuite, "format-uri-template", 2020, (uri) => typeof uri !== "string" || isUriTemplate(uri));
await testSuite(jsonSchemaTestSuite, "format-uri", 2020, (uri) => typeof uri !== "string" || isUri(uri));
await testSuite(jsonSchemaTestSuite, "format-uuid", 2020, (uuid) => typeof uuid !== "string" || isUuid(uuid));

await testSuite(ours, "format-email", 2020, (email) => typeof email !== "string" || isEmail(email));
await testSuite(ours, "format-idn-email", 2020, (email) => typeof email !== "string" || isIdnEmail(email));

// OpenAPI Format Registry
await testSuite(ours, "format-date-time-local", 2020, (dateTime) => typeof dateTime !== "string" || isDateTimeLocal(dateTime));
await testSuite(ours, "format-time-local", 2020, (time) => typeof time !== "string" || isTimeLocal(time));
await testSuite(ours, "format-http-date", 2020, (date) => typeof date !== "string" || isHttpDate(date));
await testSuite(ours, "format-media-range", 2020, (mediaRange) => typeof mediaRange !== "string" || isMediaRange(mediaRange));
await testSuite(ours, "format-sf-binary", 2020, (binary) => typeof binary !== "string" || isSfBinary(binary));
await testSuite(ours, "format-sf-boolean", 2020, (boolean) => typeof boolean !== "string" || isSfBoolean(boolean));
await testSuite(ours, "format-sf-string", 2020, (string) => typeof string !== "string" || isSfString(string));
await testSuite(ours, "format-sf-token", 2020, (token) => typeof token !== "string" || isSfToken(token));
