import { describe, expect, it } from "vitest";

import { hello } from "./hello";

describe("hello", () => {
  it("returns a greeting", () => {
    expect(hello("Angle")).toBe("Hello, Angle");
  });
});
