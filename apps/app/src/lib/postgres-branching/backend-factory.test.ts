import { describe, expect, test } from "bun:test";
import {
  createBranchStorageBackendByName,
  resolveApfsBasePath,
  resolveBranchStorageBackendName,
  resolveCopyBasePath,
  resolveZfsOptions,
} from "./backend-factory";

describe("resolveBranchStorageBackendName", () => {
  test("returns apfs on macOS", () => {
    expect(
      resolveBranchStorageBackendName({
        platform: "darwin",
        env: { NODE_ENV: "test" },
      }),
    ).toBe("apfs");
  });

  test("returns zfs on linux when a pool exists", () => {
    expect(
      resolveBranchStorageBackendName({
        platform: "linux",
        env: { NODE_ENV: "test" },
        hostState: {
          pools: ["tank"],
          datasets: [],
        },
      }),
    ).toBe("zfs");
  });

  test("returns copy on linux when no pool exists", () => {
    expect(
      resolveBranchStorageBackendName({
        platform: "linux",
        env: { NODE_ENV: "test" },
        hostState: {
          pools: [],
          datasets: [],
        },
      }),
    ).toBe("copy");
  });

  test("throws on unsupported platform", () => {
    expect(() =>
      resolveBranchStorageBackendName({
        platform: "win32",
        env: { NODE_ENV: "test" },
      }),
    ).toThrow("Postgres branching is only supported");
  });
});

describe("resolveApfsBasePath", () => {
  test("uses env override", () => {
    expect(
      resolveApfsBasePath({
        NODE_ENV: "test",
        FROST_POSTGRES_APFS_BASE: "/tmp/custom-apfs",
      }),
    ).toBe("/tmp/custom-apfs");
  });
});

describe("resolveCopyBasePath", () => {
  test("uses env override", () => {
    expect(
      resolveCopyBasePath({
        NODE_ENV: "test",
        FROST_POSTGRES_COPY_BASE: "/tmp/custom-copy",
      }),
    ).toBe("/tmp/custom-copy");
  });
});

describe("resolveZfsOptions", () => {
  test("uses defaults", () => {
    expect(resolveZfsOptions({ NODE_ENV: "test" }, undefined)).toEqual({
      pool: "",
      datasetBase: "frost/databases",
      mountBase: "/opt/frost/data/postgres/zfs",
    });
  });

  test("uses env values", () => {
    expect(
      resolveZfsOptions({
        NODE_ENV: "test",
        FROST_POSTGRES_ZFS_POOL: "tank",
        FROST_POSTGRES_ZFS_DATASET_BASE: "frost/db",
        FROST_POSTGRES_ZFS_MOUNT_BASE: "/data/zfs",
      }),
    ).toEqual({
      pool: "tank",
      datasetBase: "frost/db",
      mountBase: "/data/zfs",
    });
  });

  test("detects a single host pool when config is empty", () => {
    expect(
      resolveZfsOptions(
        { NODE_ENV: "test" },
        { pools: ["tank"], datasets: ["tank/frost/databases"] },
      ),
    ).toEqual({
      pool: "tank",
      datasetBase: "frost/databases",
      mountBase: "/opt/frost/data/postgres/zfs",
    });
  });

  test("detects pool from the existing dataset base", () => {
    expect(
      resolveZfsOptions(
        {
          NODE_ENV: "test",
          FROST_POSTGRES_ZFS_DATASET_BASE: "frost/db",
        },
        {
          pools: ["tank-a", "tank-b"],
          datasets: ["tank-b/frost/db", "tank-b/frost/db/x"],
        },
      ),
    ).toEqual({
      pool: "tank-b",
      datasetBase: "frost/db",
      mountBase: "/opt/frost/data/postgres/zfs",
    });
  });
});

describe("createBranchStorageBackendByName", () => {
  test("creates apfs backend", () => {
    const backend = createBranchStorageBackendByName("apfs", {
      NODE_ENV: "test",
      FROST_POSTGRES_APFS_BASE: "/tmp/apfs-base",
    });
    expect(backend.name).toBe("apfs");
  });

  test("creates zfs backend", () => {
    const backend = createBranchStorageBackendByName("zfs", {
      NODE_ENV: "test",
      FROST_POSTGRES_ZFS_POOL: "tank",
      FROST_POSTGRES_ZFS_DATASET_BASE: "frost/db",
      FROST_POSTGRES_ZFS_MOUNT_BASE: "/tmp/zfs",
    });
    expect(backend.name).toBe("zfs");
  });

  test("creates copy backend", () => {
    const backend = createBranchStorageBackendByName("copy", {
      NODE_ENV: "test",
      FROST_POSTGRES_COPY_BASE: "/tmp/copy-base",
    });
    expect(backend.name).toBe("copy");
  });
});
