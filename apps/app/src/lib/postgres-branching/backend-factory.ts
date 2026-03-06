import { join } from "node:path";
import { getDataDir } from "../paths";
import { ApfsBranchStorage } from "./apfs-branch-storage";
import type {
  BranchStorageBackend,
  BranchStorageBackendName,
} from "./branch-storage-backend";
import { CopyBranchStorage } from "./copy-branch-storage";
import {
  detectZfsHostState,
  resolveZfsPool,
  ZfsBranchStorage,
  type ZfsBranchStorageOptions,
  type ZfsHostState,
} from "./zfs-branch-storage";

export function resolveBranchStorageBackendName(input: {
  platform: NodeJS.Platform;
  env: NodeJS.ProcessEnv;
  hostState?: ZfsHostState;
}): BranchStorageBackendName {
  if (input.platform === "darwin") {
    return "apfs";
  }

  if (input.platform === "linux") {
    return resolveZfsOptions(input.env, input.hostState).pool.length > 0
      ? "zfs"
      : "copy";
  }

  throw new Error(
    `Postgres branching is only supported on macOS and Linux. Current platform: ${input.platform}`,
  );
}

export function resolveApfsBasePath(env: NodeJS.ProcessEnv): string {
  return env.FROST_POSTGRES_APFS_BASE ?? join(getDataDir(), "postgres", "apfs");
}

export function resolveCopyBasePath(env: NodeJS.ProcessEnv): string {
  return env.FROST_POSTGRES_COPY_BASE ?? join(getDataDir(), "postgres", "copy");
}

export function resolveZfsOptions(
  env: NodeJS.ProcessEnv,
  hostState: ZfsHostState | undefined = detectZfsHostState(),
): ZfsBranchStorageOptions {
  const datasetBase = env.FROST_POSTGRES_ZFS_DATASET_BASE ?? "frost/databases";
  return {
    pool: resolveZfsPool({
      configuredPool: env.FROST_POSTGRES_ZFS_POOL,
      datasetBase,
      hostState,
    }),
    datasetBase,
    mountBase:
      env.FROST_POSTGRES_ZFS_MOUNT_BASE ?? "/opt/frost/data/postgres/zfs",
  };
}

export function createBranchStorageBackendForPlatform(input: {
  platform: NodeJS.Platform;
  env: NodeJS.ProcessEnv;
}): BranchStorageBackend {
  const backendName = resolveBranchStorageBackendName(input);
  return createBranchStorageBackendByName(backendName, input.env);
}

export function createBranchStorageBackend(): BranchStorageBackend {
  return createBranchStorageBackendForPlatform({
    platform: process.platform,
    env: process.env,
  });
}

export function createBranchStorageBackendByName(
  backendName: BranchStorageBackendName,
  env: NodeJS.ProcessEnv,
): BranchStorageBackend {
  switch (backendName) {
    case "apfs":
      return new ApfsBranchStorage({ basePath: resolveApfsBasePath(env) });
    case "copy":
      return new CopyBranchStorage({ basePath: resolveCopyBasePath(env) });
    case "zfs":
      return new ZfsBranchStorage(resolveZfsOptions(env));
  }
}
