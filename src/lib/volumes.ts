import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function createVolume(name: string): Promise<void> {
  try {
    await execAsync(`docker volume create ${name}`);
  } catch {
    // Volume might already exist
  }
}

export async function removeVolume(name: string): Promise<void> {
  try {
    await execAsync(`docker volume rm ${name}`);
  } catch {
    // Volume might not exist or be in use
  }
}

export async function listFrostVolumes(): Promise<string[]> {
  try {
    const { stdout } = await execAsync(
      `docker volume ls --filter "name=frost-" --format "{{.Name}}"`,
    );
    return stdout.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

export async function volumeExists(name: string): Promise<boolean> {
  try {
    await execAsync(`docker volume inspect ${name}`);
    return true;
  } catch {
    return false;
  }
}

export function buildVolumeName(serviceId: string, volumeName: string): string {
  return `frost-${serviceId}-${volumeName}`;
}
