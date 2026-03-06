import { describe, expect, test } from "bun:test";
import { buildCopyCloneArgs } from "./copy-branch-storage";

describe("buildCopyCloneArgs", () => {
  test("builds cp clone args", () => {
    expect(buildCopyCloneArgs("/a/source", "/b/target")).toEqual([
      "-a",
      "/a/source",
      "/b/target",
    ]);
  });
});
