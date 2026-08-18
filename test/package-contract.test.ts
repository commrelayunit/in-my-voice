import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";

const PACKAGE_FILES = ["src", "core", "skills", "AGENTS.md", "README.md", "CHANGELOG.md", "LICENSE"];
const PACKED_FILES = [
  "AGENTS.md",
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
  "core/blocklist/ai-tells-baseline.md",
  "core/blocklist/custom-terms.md",
  "core/elicitation-bank.md",
  "core/flows/capture-flow.md",
  "core/flows/draft-flow.md",
  "core/flows/guided-profile-setup-flow.md",
  "core/flows/organize-samples-flow.md",
  "core/flows/revise-flow.md",
  "core/schemas/fixtures/invalid-elicited-source.json",
  "core/schemas/fixtures/invalid-profile.json",
  "core/schemas/fixtures/invalid-sample-path.json",
  "core/schemas/fixtures/valid-elicited-source.json",
  "core/schemas/fixtures/valid-hierarchical-profile.json",
  "core/schemas/fixtures/valid-profile.json",
  "core/schemas/voice-profile.schema.json",
  "package.json",
  "skills/in-my-voice/SKILL.md",
  "src/config.ts",
  "src/index.ts",
  "src/profiles.ts",
];

const runCommand = promisify(execFile);

type PackageManifest = {
  name: string;
  version: string;
  author: string;
  license: string;
  repository: { url: string };
  homepage: string;
  bugs: string;
  files: string[];
  pi: { extensions: string[] };
};

test("package manifest declares a real Pi extension and public package allowlist", async () => {
  const packageUrl = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageUrl, "utf8")) as PackageManifest;
  const extensionPath = "./src/index.ts";

  assert.deepEqual(
    {
      name: packageJson.name,
      version: packageJson.version,
      author: packageJson.author,
      license: packageJson.license,
      repository: packageJson.repository.url,
      homepage: packageJson.homepage,
      bugs: packageJson.bugs,
    },
    {
      name: "in-my-voice",
      version: "0.2.8",
      author: "commrelayunit",
      license: "GPL-3.0",
      repository: "git+https://github.com/commrelayunit/in-my-voice.git",
      homepage: "https://github.com/commrelayunit/in-my-voice#readme",
      bugs: "https://github.com/commrelayunit/in-my-voice/issues",
    },
  );
  assert.deepEqual(packageJson.files, PACKAGE_FILES);
  assert.deepEqual(packageJson.pi, { extensions: [extensionPath] });

  await access(new URL(extensionPath, packageUrl));

  const packed = JSON.parse(
    (await runCommand("npm", ["pack", "--dry-run", "--json"], { cwd: new URL("../", import.meta.url) })).stdout,
  ) as Array<{ files: Array<{ path: string }> }>;
  const packedArchive = packed[0];
  if (packedArchive === undefined) {
    throw new Error("npm pack did not return an archive");
  }

  assert.deepEqual(packedArchive.files.map((file) => file.path).sort(), PACKED_FILES);

  const extension = await import(new URL(extensionPath, packageUrl).href);
  assert.equal(typeof extension.default, "function");
});
