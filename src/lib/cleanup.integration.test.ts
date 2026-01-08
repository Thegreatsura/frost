import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { exec } from "node:child_process";
import { join } from "node:path";
import { promisify } from "node:util";
import {
  buildImage,
  getImageCreatedAt,
  getImageSize,
  getRunningImageNames,
  isNetworkInUse,
  listFrostImages,
  listFrostNetworks,
  removeImage,
  removeNetwork,
  runContainer,
  stopContainer,
  createNetwork,
} from "./docker";

const execAsync = promisify(exec);

const TEST_PREFIX = "frost-cleanup-test";
const TEST_NETWORK = "frost-net-cleanup-test";
const FIXTURE_PATH = join(process.cwd(), "test/fixtures/simple-node");

describe("cleanup docker functions", () => {
  beforeAll(async () => {
    await execAsync(`docker rmi $(docker images -q '${TEST_PREFIX}*') 2>/dev/null || true`);
    await execAsync(`docker rm -f $(docker ps -aq --filter name=${TEST_PREFIX}) 2>/dev/null || true`);
    await execAsync(`docker network rm ${TEST_NETWORK} 2>/dev/null || true`);
  }, 30000);

  afterAll(async () => {
    await execAsync(`docker rmi $(docker images -q '${TEST_PREFIX}*') 2>/dev/null || true`);
    await execAsync(`docker rm -f $(docker ps -aq --filter name=${TEST_PREFIX}) 2>/dev/null || true`);
    await execAsync(`docker network rm ${TEST_NETWORK} 2>/dev/null || true`);
  }, 30000);

  test("listFrostImages returns frost-prefixed images", async () => {
    const result = await buildImage(FIXTURE_PATH, `${TEST_PREFIX}-svc:v1`, "Dockerfile");
    expect(result.success).toBe(true);

    const images = await listFrostImages();
    const testImages = images.filter((i) => i.startsWith(TEST_PREFIX));
    expect(testImages.length).toBeGreaterThanOrEqual(1);
    expect(testImages).toContain(`${TEST_PREFIX}-svc:v1`);
  }, 60000);

  test("getImageCreatedAt returns valid date", async () => {
    const created = await getImageCreatedAt(`${TEST_PREFIX}-svc:v1`);
    expect(created).toBeInstanceOf(Date);
    expect(created.getTime()).toBeGreaterThan(0);
  });

  test("getImageSize returns positive number", async () => {
    const size = await getImageSize(`${TEST_PREFIX}-svc:v1`);
    expect(size).toBeGreaterThan(0);
  });

  test("removeImage deletes an image", async () => {
    await buildImage(FIXTURE_PATH, `${TEST_PREFIX}-todelete:v1`, "Dockerfile");

    const before = await listFrostImages();
    expect(before).toContain(`${TEST_PREFIX}-todelete:v1`);

    const removed = await removeImage(`${TEST_PREFIX}-todelete:v1`);
    expect(removed).toBe(true);

    const after = await listFrostImages();
    expect(after).not.toContain(`${TEST_PREFIX}-todelete:v1`);
  }, 60000);

  test("getRunningImageNames returns running container images", async () => {
    const run = await runContainer({
      imageName: `${TEST_PREFIX}-svc:v1`,
      hostPort: 19998,
      containerPort: 3000,
      name: `${TEST_PREFIX}-container`,
    });
    expect(run.success).toBe(true);

    const running = await getRunningImageNames();
    expect(running.has(`${TEST_PREFIX}-svc:v1`)).toBe(true);

    await stopContainer(`${TEST_PREFIX}-container`);
  }, 30000);

  test("listFrostNetworks returns frost-net-prefixed networks", async () => {
    await createNetwork(TEST_NETWORK);

    const networks = await listFrostNetworks();
    expect(networks).toContain(TEST_NETWORK);
  });

  test("isNetworkInUse detects containers attached", async () => {
    await createNetwork(TEST_NETWORK);

    const notInUse = await isNetworkInUse(TEST_NETWORK);
    expect(notInUse).toBe(false);

    await runContainer({
      imageName: `${TEST_PREFIX}-svc:v1`,
      hostPort: 19997,
      containerPort: 3000,
      name: `${TEST_PREFIX}-net-test`,
      network: TEST_NETWORK,
    });

    const inUse = await isNetworkInUse(TEST_NETWORK);
    expect(inUse).toBe(true);

    await stopContainer(`${TEST_PREFIX}-net-test`);
  }, 30000);

  test("removeNetwork deletes unused network", async () => {
    await createNetwork(TEST_NETWORK);

    const before = await listFrostNetworks();
    expect(before).toContain(TEST_NETWORK);

    await removeNetwork(TEST_NETWORK);

    const after = await listFrostNetworks();
    expect(after).not.toContain(TEST_NETWORK);
  });
});
