// The validity of address literals is tested in test-suite/tests. Throwing can't be written in the test suite's
// format.
import { describe, test, expect } from "vitest";
import { isEmail, isIdnEmail } from "./index.js";

describe("An address literal with an unknown tag", () => {
  test("throws, since whether it's valid can't be known", () => {
    expect(() => isEmail("a@[x-y:abc]")).to.throw("Encountered unknown Address Literal Tag: x-y");
    expect(() => isIdnEmail("a@[x-y:abc]")).to.throw("Encountered unknown Address Literal Tag: x-y");
  });
});
