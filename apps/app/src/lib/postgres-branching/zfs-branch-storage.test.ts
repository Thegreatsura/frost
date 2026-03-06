import { describe, expect, test } from "bun:test";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildZfsCloneArgs,
  buildZfsCreateArgs,
  buildZfsDatasetPath,
  buildZfsMountPath,
  normalizeDatasetBase,
  normalizeStorageRef,
  resolveSystemCommand,
  resolveZfsPool,
} from "./zfs-branch-storage";

describe("normalizeDatasetBase", () => {
  test("trims slashes", () => {
    expect(normalizeDatasetBase("/frost/databases/")).toBe("frost/databases");
  });
});

describe("normalizeStorageRef", () => {
  test("trims slashes", () => {
    expect(normalizeStorageRef("/db/target/live/")).toBe("db/target/live");
  });
});

describe("buildZfsDatasetPath", () => {
  test("builds dataset path", () => {
    expect(buildZfsDatasetPath("tank", "frost/databases", "a/b/live")).toBe(
      "tank/frost/databases/a/b/live",
    );
  });
});

describe("buildZfsMountPath", () => {
  test("builds mount path", () => {
    expect(buildZfsMountPath("/opt/frost/data/postgres/zfs", "a/b/live")).toBe(
      "/opt/frost/data/postgres/zfs/a/b/live",
    );
  });
});

describe("buildZfsCreateArgs", () => {
  test("includes tuned properties", () => {
    expect(
      buildZfsCreateArgs(
        "tank/frost/databases/a/b/live",
        "/opt/frost/data/postgres/zfs/a/b/live",
      ),
    ).toEqual([
      "create",
      "-p",
      "-o",
      "compression=lz4",
      "-o",
      "recordsize=8k",
      "-o",
      "atime=off",
      "-o",
      "mountpoint=/opt/frost/data/postgres/zfs/a/b/live",
      "tank/frost/databases/a/b/live",
    ]);
  });
});

describe("buildZfsCloneArgs", () => {
  test("includes tuned properties", () => {
    expect(
      buildZfsCloneArgs(
        "tank/frost/databases/a/b/live@frost-1",
        "tank/frost/databases/a/c/live",
        "/opt/frost/data/postgres/zfs/a/c/live",
      ),
    ).toEqual([
      "clone",
      "-p",
      "-o",
      "compression=lz4",
      "-o",
      "recordsize=8k",
      "-o",
      "atime=off",
      "-o",
      "mountpoint=/opt/frost/data/postgres/zfs/a/c/live",
      "tank/frost/databases/a/b/live@frost-1",
      "tank/frost/databases/a/c/live",
    ]);
  });
});

describe("resolveZfsPool", () => {
  test("keeps configured pool", () => {
    expect(
      resolveZfsPool({
        configuredPool: "tank",
        datasetBase: "frost/databases",
        hostState: {
          pools: ["pool-a", "pool-b"],
          datasets: ["pool-b/frost/databases"],
        },
      }),
    ).toBe("tank");
  });

  test("detects a single host pool", () => {
    expect(
      resolveZfsPool({
        datasetBase: "frost/databases",
        hostState: {
          pools: ["tank"],
          datasets: [],
        },
      }),
    ).toBe("tank");
  });

  test("detects pool from existing dataset base", () => {
    expect(
      resolveZfsPool({
        datasetBase: "frost/databases",
        hostState: {
          pools: ["pool-a", "pool-b"],
          datasets: ["pool-b/frost/databases", "pool-b/frost/databases/db-1"],
        },
      }),
    ).toBe("pool-b");
  });
});

describe("resolveSystemCommand", () => {
  test("finds commands in fallback dirs", () => {
    const tempDir = mkdtempSync("/tmp/frost-zfs-command-");
    const commandPath = join(tempDir, "zpool");

    try {
      writeFileSync(commandPath, "#!/bin/sh\nexit 0\n");
      chmodSync(commandPath, 0o755);

      expect(resolveSystemCommand("zpool", "", [tempDir])).toBe(commandPath);
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
