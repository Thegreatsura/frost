import { describe, expect, test } from "bun:test";
import { join, relative } from "node:path";

// Extracted logic from buildImage for testability
function resolveDockerfilePath(
  repoPath: string,
  dockerfilePath: string,
  buildContext?: string,
): string {
  const contextPath = buildContext ? join(repoPath, buildContext) : repoPath;
  return buildContext
    ? relative(contextPath, join(repoPath, dockerfilePath))
    : dockerfilePath;
}

describe("resolveDockerfilePath", () => {
  const repoPath = "/repos/my-app";

  test("no build context returns dockerfile as-is", () => {
    expect(resolveDockerfilePath(repoPath, "Dockerfile")).toBe("Dockerfile");
  });

  test("no build context with subdirectory dockerfile", () => {
    expect(resolveDockerfilePath(repoPath, "apps/web/Dockerfile")).toBe(
      "apps/web/Dockerfile",
    );
  });

  test("build context matching dockerfile directory", () => {
    expect(
      resolveDockerfilePath(repoPath, "apps/web/Dockerfile", "apps/web"),
    ).toBe("Dockerfile");
  });

  test("build context different from dockerfile directory", () => {
    expect(
      resolveDockerfilePath(repoPath, "docker/Dockerfile.prod", "apps/web"),
    ).toBe("../../docker/Dockerfile.prod");
  });

  test("root dockerfile with subdirectory build context", () => {
    expect(
      resolveDockerfilePath(repoPath, "Dockerfile", "apps/web"),
    ).toBe("../../Dockerfile");
  });
});
