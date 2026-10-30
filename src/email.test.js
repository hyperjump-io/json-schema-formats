import { describe, test, expect } from "vitest";
import { isEmail, isIdnEmail } from "./index.js";

describe.each([
  ["isEmail", isEmail],
  ["isIdnEmail", isIdnEmail]
])("%s address literals", (_name, fn) => {
  test("a valid IPv6 address literal is valid", () => {
    expect(fn("joe@[IPv6:::1]")).to.equal(true);
  });

  test("the IPv6 tag is case-insensitive", () => {
    expect(fn("joe@[ipv6:::1]")).to.equal(true);
  });

  test("a malformed IPv6 address literal is invalid", () => {
    expect(fn("joe@[IPv6:zzzz]")).to.equal(false);
  });

  test("a malformed IPv6 address literal with a lowercase tag is invalid", () => {
    expect(fn("joe@[ipv6:zzzz]")).to.equal(false);
  });

  test("an unknown address literal tag throws", () => {
    expect(() => fn("joe@[foo:bar]")).to.throw("Encountered unknown Address Literal Tag: foo");
  });
});
