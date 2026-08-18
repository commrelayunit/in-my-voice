import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const CONFIG_FILENAME = "in-my-voice.json";

export type ImvConfig = {
  selectedProfile?: string;
};

export type ConfigReadResult =
  | { kind: "missing"; path: string }
  | { kind: "valid"; path: string; config: ImvConfig }
  | { kind: "invalid"; path: string };

export function parseConfig(value: unknown): ImvConfig | undefined {
  if (!isPlainObject(value)) {
    return undefined;
  }

  const keys = Object.keys(value);
  if (keys.some((key) => key !== "selectedProfile")) {
    return undefined;
  }

  if (value.selectedProfile === undefined) {
    return {};
  }
  if (typeof value.selectedProfile !== "string" || value.selectedProfile.trim() === "") {
    return undefined;
  }

  return { selectedProfile: value.selectedProfile };
}

export async function readConfig(path: string): Promise<ConfigReadResult> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch (error) {
    if (isMissingFile(error)) {
      return { kind: "missing", path };
    }
    return { kind: "invalid", path };
  }

  try {
    const config = parseConfig(JSON.parse(text) as unknown);
    return config === undefined ? { kind: "invalid", path } : { kind: "valid", path, config };
  } catch {
    return { kind: "invalid", path };
  }
}

export async function writeConfigAtomically(path: string, config: ImvConfig): Promise<void> {
  const temporaryPath = `${path}.${randomUUID()}.tmp`;
  const contents = `${JSON.stringify(config, null, 2)}\n`;

  try {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(temporaryPath, contents, { encoding: "utf8", flag: "wx" });
    await rename(temporaryPath, path);
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMissingFile(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
