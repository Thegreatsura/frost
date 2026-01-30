import { describe, expect, test } from "bun:test";
import { buildVolumeName, pathToVolumeName } from "./volumes";

describe("buildVolumeName", () => {
  test("creates correct format", () => {
    expect(buildVolumeName("abc123", "data")).toBe("frost-abc123-data");
    expect(buildVolumeName("svc1", "data")).toBe("frost-svc1-data");
    expect(buildVolumeName("svc2", "logs")).toBe("frost-svc2-logs");
    expect(buildVolumeName("my-service", "db")).toBe("frost-my-service-db");
  });

  test("handles nanoid-like service IDs", () => {
    expect(buildVolumeName("V1StGXR8_Z5jdHi6B-myT", "data")).toBe(
      "frost-V1StGXR8_Z5jdHi6B-myT-data",
    );
  });
});

describe("pathToVolumeName", () => {
  test("converts paths to volume names", () => {
    expect(pathToVolumeName("/data")).toBe("data");
    expect(pathToVolumeName("/var/lib/postgres")).toBe("var-lib-postgres");
    expect(pathToVolumeName("/app/uploads")).toBe("app-uploads");
  });

  test("preserves dots and underscores", () => {
    expect(pathToVolumeName("/root/.antigravity_tools")).toBe(
      "root-.antigravity_tools",
    );
    expect(pathToVolumeName("/var/my_data")).toBe("var-my_data");
    expect(pathToVolumeName("/home/user/.config/my_app")).toBe(
      "home-user-.config-my_app",
    );
  });
});
