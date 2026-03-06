import { execFile } from "node:child_process";
import { mkdir, rename, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import type {
  BranchStorageBackend,
  BranchStorageHandle,
} from "./branch-storage-backend";

const execFileAsync = promisify(execFile);

export interface CopyBranchStorageOptions {
  basePath: string;
}

export function buildCopyCloneArgs(
  sourcePath: string,
  targetPath: string,
): string[] {
  return ["-a", sourcePath, targetPath];
}

async function runExecFile(command: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync(command, args);
    return stdout;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${command} failed: ${message}`);
  }
}

export class CopyBranchStorage implements BranchStorageBackend {
  readonly name = "copy" as const;
  private readonly basePath: string;

  constructor(options: CopyBranchStorageOptions) {
    this.basePath = options.basePath;
  }

  async assertReady(): Promise<void> {
    await mkdir(this.basePath, { recursive: true });
  }

  async createEmptyStorage(storageRef: string): Promise<BranchStorageHandle> {
    const path = this.resolveAbsolutePath(storageRef);
    await rm(path, { recursive: true, force: true });
    await mkdir(path, { recursive: true });
    return this.toHandle(storageRef);
  }

  async cloneStorage(
    sourceStorageRef: string,
    targetStorageRef: string,
  ): Promise<BranchStorageHandle> {
    const sourcePath = this.resolveAbsolutePath(sourceStorageRef);
    const targetPath = this.resolveAbsolutePath(targetStorageRef);

    await rm(targetPath, { recursive: true, force: true });
    await mkdir(dirname(targetPath), { recursive: true });
    await runExecFile("cp", buildCopyCloneArgs(sourcePath, targetPath));

    return this.toHandle(targetStorageRef);
  }

  async swapStorage(
    liveStorageRef: string,
    stagedStorageRef: string,
  ): Promise<void> {
    const livePath = this.resolveAbsolutePath(liveStorageRef);
    const stagedPath = this.resolveAbsolutePath(stagedStorageRef);
    const backupPath = `${livePath}.old`;

    await rm(backupPath, { recursive: true, force: true });
    await rename(livePath, backupPath);

    try {
      await rename(stagedPath, livePath);
    } catch (error) {
      await rename(backupPath, livePath).catch(() => undefined);
      throw error;
    }

    await rm(backupPath, { recursive: true, force: true });
  }

  async removeStorage(storageRef: string): Promise<void> {
    const path = this.resolveAbsolutePath(storageRef);
    await rm(path, { recursive: true, force: true });
  }

  async resolveMountPath(storageRef: string): Promise<string> {
    return this.resolveAbsolutePath(storageRef);
  }

  private resolveAbsolutePath(storageRef: string): string {
    return join(this.basePath, storageRef);
  }

  private toHandle(storageRef: string): BranchStorageHandle {
    return {
      storageBackend: this.name,
      storageRef,
      mountPath: this.resolveAbsolutePath(storageRef),
    };
  }
}
