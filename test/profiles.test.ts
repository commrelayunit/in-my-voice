import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { listProfileNames } from "../src/profiles.ts";

test("lists profile names from filenames without reading profile contents", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "imv-profiles-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  await writeFile(join(directory, "work.json"), "not-json-but-never-read", "utf8");
  await writeFile(join(directory, "academic.json"), "not-json-but-never-read", "utf8");
  await writeFile(join(directory, ".hidden.json"), "{}", "utf8");
  await writeFile(join(directory, "notes.txt"), "{}", "utf8");
  await mkdir(join(directory, "nested.json"));

  assert.deepEqual(await listProfileNames(directory), ["academic", "work"]);
});

test("a missing profile directory is an empty profile list", async () => {
  assert.deepEqual(await listProfileNames(join(tmpdir(), "imv-missing-profile-dir")), []);
});
