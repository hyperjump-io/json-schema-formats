import { describe, test, expect } from "vitest";
import { isEmail, isIdnEmail } from "./index.js";

describe("An address literal with the IPv6 tag", () => {
  test("is valid if it's an IPv6 address", () => {
    expect(isEmail("a@[IPv6:::1]")).to.equal(true);
    expect(isEmail("a@[ipv6:1::]")).to.equal(true);
    expect(isIdnEmail("a@[IPv6:::1]")).to.equal(true);
  });

  test("isn't valid if it isn't an IPv6 address", () => {
    expect(isEmail("a@[IPv6:1::2::3]")).to.equal(false);
    expect(isEmail("a@[ipv6:zz]")).to.equal(false);
    expect(isIdnEmail("a@[IPv6:1::2::3]")).to.equal(false);
    expect(isIdnEmail("a@[ipv6:zz]")).to.equal(false);
  });

  test("isn't an unknown tag", () => {
    expect(() => isEmail("a@[x-y:abc]")).to.throw("Encountered unknown Address Literal Tag: x-y");
    expect(isIdnEmail("a@[x-y:abc]")).to.equal(true);
  });
});
