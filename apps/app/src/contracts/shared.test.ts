import { describe, expect, test } from "bun:test";
import { volumeConfigSchema } from "./shared";

describe("volumeConfigSchema", () => {
  test("accepts valid names", () => {
    const valid = [
      { name: "data", path: "/data" },
      { name: "root-.antigravity_tools", path: "/root/.antigravity_tools" },
      { name: "var-my_data", path: "/var/my_data" },
      { name: "home-user-.config-my_app", path: "/home/user/.config/my_app" },
    ];
    for (const input of valid) {
      expect(volumeConfigSchema.safeParse(input).success).toBe(true);
    }
  });

  test("rejects invalid names", () => {
    expect(
      volumeConfigSchema.safeParse({ name: "my data", path: "/data" }).success,
    ).toBe(false);
    expect(
      volumeConfigSchema.safeParse({ name: "MyData", path: "/data" }).success,
    ).toBe(false);
  });

  test("rejects path without leading slash", () => {
    expect(
      volumeConfigSchema.safeParse({ name: "data", path: "data" }).success,
    ).toBe(false);
  });
});
