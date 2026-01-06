import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { join } from "node:path";

let spawnMock: ReturnType<typeof mock>;
let capturedArgs: string[] = [];
let capturedOptions: { cwd?: string } = {};

beforeEach(() => {
  capturedArgs = [];
  capturedOptions = {};

  spawnMock = mock((cmd: string, args: string[], options: { cwd?: string }) => {
    capturedArgs = args;
    capturedOptions = options;
    return {
      stdout: { on: mock(() => {}) },
      stderr: { on: mock(() => {}) },
      on: mock((event: string, callback: (code: number) => void) => {
        if (event === "close") {
          setTimeout(() => callback(0), 0);
        }
      }),
    };
  });

  mock.module("node:child_process", () => ({
    spawn: spawnMock,
    exec: mock(),
  }));
});

afterEach(() => {
  mock.restore();
});

describe("buildImage", () => {
  test("uses dockerfile directory as build context for nested path", async () => {
    const { buildImage } = await import("./docker");

    const repoPath = "/repos/test-service";
    const dockerfilePath = "test/fixtures/simple-node/Dockerfile";

    await buildImage(repoPath, "test-image:latest", dockerfilePath);

    expect(capturedArgs).toContain("-f");
    const fIndex = capturedArgs.indexOf("-f");
    expect(capturedArgs[fIndex + 1]).toBe("Dockerfile");

    expect(capturedOptions.cwd).toBe(
      join(repoPath, "test/fixtures/simple-node"),
    );
  });

  test("uses repo root as context for root-level Dockerfile", async () => {
    const { buildImage } = await import("./docker");

    const repoPath = "/repos/test-service";
    const dockerfilePath = "Dockerfile";

    await buildImage(repoPath, "test-image:latest", dockerfilePath);

    expect(capturedArgs).toContain("-f");
    const fIndex = capturedArgs.indexOf("-f");
    expect(capturedArgs[fIndex + 1]).toBe("Dockerfile");

    expect(capturedOptions.cwd).toBe(repoPath);
  });

  test("handles subdirectory dockerfile path", async () => {
    const { buildImage } = await import("./docker");

    const repoPath = "/repos/test-service";
    const dockerfilePath = "docker/Dockerfile.prod";

    await buildImage(repoPath, "test-image:latest", dockerfilePath);

    expect(capturedArgs).toContain("-f");
    const fIndex = capturedArgs.indexOf("-f");
    expect(capturedArgs[fIndex + 1]).toBe("Dockerfile.prod");

    expect(capturedOptions.cwd).toBe(join(repoPath, "docker"));
  });
});
