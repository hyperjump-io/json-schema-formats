import { describe, test, expect } from "vitest";
import * as Formats from "./index.js";

// The OpenAPI Format Registry's formats that have no test suite. The values are from the RFCs' examples, and their edge
// cases.

describe("date-time-local", () => {
  test.each([
    ["1985-04-12T23:20:50.52", true],
    ["2020-02-29T00:00:00", true],
    ["2020-01-01t00:00:00", true],
    ["2021-02-29T00:00:00", false],
    ["1990-12-31T23:59:60", false],
    ["1985-04-12T23:20:50Z", false],
    ["1985-04-12T23:20:50+01:00", false],
    ["1985-04-12 23:20:50", false],
    ["1985-04-12", false]
  ])("%o is %o", (value, expected) => {
    expect(Formats.isDateTimeLocal(value)).to.equal(expected);
  });
});

describe("time-local", () => {
  test.each([
    ["23:20:50.52", true],
    ["00:00:00", true],
    ["23:59:60", false],
    ["24:00:00", false],
    ["23:20:50Z", false],
    ["23:20", false],
    ["23:20:50.", false]
  ])("%o is %o", (value, expected) => {
    expect(Formats.isTimeLocal(value)).to.equal(expected);
  });
});

describe("http-date", () => {
  test.each([
    // RFC 9110's examples, of each form
    ["Sun, 06 Nov 1994 08:49:37 GMT", true],
    ["Sunday, 06-Nov-94 08:49:37 GMT", true],
    ["Sun Nov  6 08:49:37 1994", true],
    ["Sun Nov 06 08:49:37 1994", true],

    // Days in a month
    ["Thu, 29 Feb 2024 00:00:00 GMT", true],
    ["Thu, 29 Feb 2001 00:00:00 GMT", false],
    ["Tue, 29 Feb 2000 00:00:00 GMT", true],
    ["Mon, 29 Feb 1900 00:00:00 GMT", false],
    ["Sun, 31 Nov 1994 08:49:37 GMT", false],
    ["Sun, 00 Nov 1994 08:49:37 GMT", false],

    // An rfc850-date's year has no century, so February 29 is checked for a year that's a leap year in some century
    ["Thursday, 29-Feb-24 00:00:00 GMT", true],
    ["Tuesday, 29-Feb-00 00:00:00 GMT", true],
    ["Monday, 29-Feb-21 00:00:00 GMT", false],

    // Day names
    ["Mon, 06 Nov 1994 08:49:37 GMT", false],
    ["Mon Nov  6 08:49:37 1994", false],
    ["Monday, 06-Nov-94 08:49:37 GMT", true],
    ["sun, 06 Nov 1994 08:49:37 GMT", false],
    ["Sun, 06 Nov 1994 08:49:37 GMT", true],
    ["Sun, 06 nov 1994 08:49:37 GMT", false],

    // Leap seconds
    ["Sat, 31 Dec 2016 23:59:60 GMT", true],
    ["Sun, 31 Dec 2017 23:59:60 GMT", false],
    ["Sun, 06 Nov 1994 08:49:60 GMT", false],
    ["Tue Jun 30 23:59:60 2015", true],
    ["Saturday, 31-Dec-16 23:59:60 GMT", true],
    ["Sunday, 06-Nov-94 08:49:60 GMT", false],

    // The grammar
    ["Sun, 06 Nov 1994 08:49:37 UTC", false],
    ["Sun, 06 Nov 1994 08:49:37 gmt", false],
    ["Sun, 06 Nov 1994 08:49:37", false],
    ["Sun, 6 Nov 1994 08:49:37 GMT", false],
    ["Sun Nov 6 08:49:37 1994", false],
    ["Sun, 06 Nov 1994 24:00:00 GMT", false],
    ["Sun,  06 Nov 1994 08:49:37 GMT", false],
    ["Sunday, 06-Nov-1994 08:49:37 GMT", false],
    ["1994-11-06T08:49:37Z", false],
    ["", false]
  ])("%o is %o", (value, expected) => {
    expect(Formats.isHttpDate(value)).to.equal(expected);
  });
});

describe("media-range", () => {
  test.each([
    ["*/*", true],
    ["text/*", true],
    ["text/html", true],
    ["text/html;charset=utf-8", true],
    ["text/html ; charset=\"utf-8\"", true],
    ["text/html;level=1;q=0.7", true],
    ["text/html;", true],
    ["text/html;;a=b", true],
    ["a/b;c=\"d\\\"e\"", true],
    ["a/b;c=\"é\"", true],
    ["a/b;c=\"ā\"", false],
    ["text", false],
    ["text/", false],
    ["/html", false],
    ["text/html ", false],
    ["text/html,text/plain", false],
    ["text/html;charset", false],
    ["text/html;charset = utf-8", false],
    ["text/html;charset=\"utf-8", false],
    ["text/html;charset=utf 8", false],
    ["text/(html)", false]
  ])("%o is %o", (value, expected) => {
    expect(Formats.isMediaRange(value)).to.equal(expected);
  });
});

describe("sf-binary", () => {
  test.each([
    [":cHJldGVuZCB0aGlzIGlzIGJpbmFyeSBjb250ZW50Lg==:", true],
    ["::", true],
    [":YQ:", true],
    [":YQ==:", true],
    [":a=b:", false],
    [":=a:", false],
    [":cHJldGVuZA==", false],
    ["cHJldGVuZA==", false],
    [":cHJl dGVuZA==:", false],
    [":cHJl-GVuZA==:", false],
    [":a::", false]
  ])("%o is %o", (value, expected) => {
    expect(Formats.isSfBinary(value)).to.equal(expected);
  });
});

describe("sf-boolean", () => {
  test.each([
    ["?1", true],
    ["?0", true],
    ["?2", false],
    ["?", false],
    ["1", false],
    ["?10", false],
    ["true", false]
  ])("%o is %o", (value, expected) => {
    expect(Formats.isSfBoolean(value)).to.equal(expected);
  });
});

describe("sf-string", () => {
  test.each([
    ["\"hello world\"", true],
    ["\"\"", true],
    ["\"a \\\"b\\\" \\\\\"", true],
    ["\"a\\nb\"", false],
    ["\"a\tb\"", false],
    ["\"é\"", false],
    ["\"a", false],
    ["a\"", false],
    ["\"a\"b", false],
    ["hello", false]
  ])("%o is %o", (value, expected) => {
    expect(Formats.isSfString(value)).to.equal(expected);
  });
});

describe("sf-token", () => {
  test.each([
    ["foo123/456", true],
    ["*", true],
    ["a:b/c!#$%&'*+-.^_`|~", true],
    ["1a", false],
    ["-a", false],
    ["a b", false],
    ["a,b", false],
    ["\"a\"", false],
    ["", false]
  ])("%o is %o", (value, expected) => {
    expect(Formats.isSfToken(value)).to.equal(expected);
  });
});
