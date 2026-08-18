import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, join } from "node:path";

export function getProfileDirectory(): string {
  return process.env.IN_MY_VOICE_PROFILE_DIR ?? join(homedir(), ".in-my-voice", "profiles");
}

export async function listProfileNames(profileDirectory = getProfileDirectory()): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(profileDirectory, { withFileTypes: true });
  } catch (error) {
    if (isMissingDirectory(error)) {
      return [];
    }
    throw error;
  }

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json") && !entry.name.startsWith("."))
    .map((entry) => basename(entry.name, ".json"))
    .filter((name) => name.trim() !== "")
    .sort((left, right) => left.localeCompare(right));
}

function isMissingDirectory(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
