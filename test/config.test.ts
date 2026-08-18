import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { parseConfig, readConfig, writeConfigAtomically } from "../src/config.ts";

test("validates the minimal In My Voice Pi configuration schema", () => {
  assert.deepEqual(parseConfig({}), {});
  assert.deepEqual(parseConfig({ selectedProfile: "work" }), { selectedProfile: "work" });

  for (const invalid of [
    null,
    [],
    "config",
    { selectedProfile: "" },
    { selectedProfile: " " },
    { selectedProfile: 42 },
    { selectedProfile: "work", rawSample: "private" },
  ]) {
    assert.equal(parseConfig(invalid), undefined);
  }
});

test("writes readable configuration atomically", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "imv-config-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  const path = join(directory, ".pi", "in-my-voice.json");
  const config = { selectedProfile: "academic" } as const;
  await writeConfigAtomically(path, config);

  assert.equal(await readFile(path, "utf8"), '{\n  "selectedProfile": "academic"\n}\n');
  assert.deepEqual(await readConfig(path), { kind: "valid", path, config });
});

test("distinguishes missing and invalid configuration files", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "imv-config-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  const missingPath = join(directory, "missing.json");
  assert.deepEqual(await readConfig(missingPath), { kind: "missing", path: missingPath });

  const invalidPath = join(directory, "invalid.json");
  await writeFile(invalidPath, "{ not json", "utf8");
  assert.deepEqual(await readConfig(invalidPath), { kind: "invalid", path: invalidPath });
});
