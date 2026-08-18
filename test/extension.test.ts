import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { CONFIG_FILENAME, readConfig } from "../src/config.ts";
import inMyVoice from "../src/index.ts";

type Notification = { message: string; type: "info" | "warning" | "error" | undefined };
type RegisteredCommand = {
  description: string;
  getArgumentCompletions(prefix: string): Array<{ value: string; label: string }> | null;
  handler(args: string, ctx: ExtensionCommandContext): Promise<void>;
};
type AppendedEntry = { type: string; data: unknown };

function createExtension(): { command: RegisteredCommand; entries: AppendedEntry[] } {
  let command: RegisteredCommand | undefined;
  const entries: AppendedEntry[] = [];
  const api = {
    registerCommand(name: string, registered: RegisteredCommand) {
      assert.equal(name, "imv");
      command = registered;
    },
    registerEntryRenderer() {
      // Rendering is covered by Pi's API; command behavior asserts the appended data.
    },
    appendEntry(type: string, data: unknown) {
      entries.push({ type, data });
    },
  } as unknown as ExtensionAPI;

  inMyVoice(api);
  if (command === undefined) {
    throw new Error("In My Voice did not register /imv");
  }

  return { command, entries };
}

function createContext(options: {
  cwd: string;
  selectAnswers?: Array<string | undefined>;
  mode?: "tui" | "print";
}): { context: ExtensionCommandContext; notifications: Notification[]; selectedTitles: string[] } {
  const notifications: Notification[] = [];
  const selectedTitles: string[] = [];
  const selectAnswers = [...(options.selectAnswers ?? [])];
  const context = {
    mode: options.mode ?? "tui",
    cwd: options.cwd,
    ui: {
      notify(message: string, type?: Notification["type"]) {
        notifications.push({ message, type });
      },
      async select(title: string): Promise<string | undefined> {
        selectedTitles.push(title);
        return selectAnswers.shift();
      },
    },
  } as unknown as ExtensionCommandContext;

  return { context, notifications, selectedTitles };
}

test("registers /imv with command completions", () => {
  const { command } = createExtension();

  assert.equal(command.description, "Use In My Voice writing workflows");
  assert.deepEqual(command.getArgumentCompletions("d"), [{ value: "draft", label: "draft" }]);
  assert.deepEqual(command.getArgumentCompletions(""), [
    { value: "profile", label: "profile" },
    { value: "capture", label: "capture" },
    { value: "organize", label: "organize" },
    { value: "draft", label: "draft" },
    { value: "revise", label: "revise" },
  ]);
  assert.equal(command.getArgumentCompletions("profile "), null);
});

test("/imv profile selects a profile name without reading profile contents", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "imv-extension-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const previousAgentDir = process.env.PI_CODING_AGENT_DIR;
  const previousProfileDir = process.env.IN_MY_VOICE_PROFILE_DIR;
  process.env.PI_CODING_AGENT_DIR = join(directory, "agent");
  process.env.IN_MY_VOICE_PROFILE_DIR = join(directory, "profiles");
  t.after(() => {
    if (previousAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = previousAgentDir;
    if (previousProfileDir === undefined) delete process.env.IN_MY_VOICE_PROFILE_DIR;
    else process.env.IN_MY_VOICE_PROFILE_DIR = previousProfileDir;
  });

  await mkdir(process.env.IN_MY_VOICE_PROFILE_DIR);
  await writeFile(join(process.env.IN_MY_VOICE_PROFILE_DIR, "work.json"), "private profile contents", "utf8");

  const { command } = createExtension();
  const { context, notifications } = createContext({ cwd: join(directory, "project") });
  await command.handler("profile work", context);

  const configPath = join(process.env.PI_CODING_AGENT_DIR, CONFIG_FILENAME);
  assert.deepEqual(await readConfig(configPath), {
    kind: "valid",
    path: configPath,
    config: { selectedProfile: "work" },
  });
  assert.deepEqual(notifications, [{ message: "In My Voice profile selected: work.", type: "info" }]);
});

test("/imv profile lists profiles through Pi selection when no name is supplied", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "imv-extension-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const previousAgentDir = process.env.PI_CODING_AGENT_DIR;
  const previousProfileDir = process.env.IN_MY_VOICE_PROFILE_DIR;
  process.env.PI_CODING_AGENT_DIR = join(directory, "agent");
  process.env.IN_MY_VOICE_PROFILE_DIR = join(directory, "profiles");
  t.after(() => {
    if (previousAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = previousAgentDir;
    if (previousProfileDir === undefined) delete process.env.IN_MY_VOICE_PROFILE_DIR;
    else process.env.IN_MY_VOICE_PROFILE_DIR = previousProfileDir;
  });

  await mkdir(process.env.IN_MY_VOICE_PROFILE_DIR);
  await writeFile(join(process.env.IN_MY_VOICE_PROFILE_DIR, "academic.json"), "private profile contents", "utf8");

  const { command } = createExtension();
  const { context, selectedTitles } = createContext({
    cwd: join(directory, "project"),
    selectAnswers: ["academic"],
  });
  await command.handler("profile", context);

  assert.deepEqual(selectedTitles, ["Select In My Voice profile"]);
});

test("flow commands append authoritative flow markdown instead of forking behavior", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "imv-extension-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const previousAgentDir = process.env.PI_CODING_AGENT_DIR;
  process.env.PI_CODING_AGENT_DIR = join(directory, "agent");
  t.after(() => {
    if (previousAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = previousAgentDir;
  });

  const { command, entries } = createExtension();
  const { context } = createContext({ cwd: join(directory, "project") });
  await command.handler("draft", context);

  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.type, "in-my-voice.flow");
  assert.deepEqual((entries[0]?.data as { title: string }).title, "In My Voice Draft Flow");
  assert.match((entries[0]?.data as { markdown: string }).markdown, /Authoritative source: `core\/flows\/draft-flow\.md`/);
  assert.match((entries[0]?.data as { markdown: string }).markdown, /# Flow: Draft In A Captured Voice/);
});

test("commands do nothing outside TUI mode", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "imv-extension-"));
  t.after(() => rm(directory, { recursive: true, force: true }));

  const { command, entries } = createExtension();
  const { context, notifications } = createContext({ cwd: directory, mode: "print" });
  await command.handler("draft", context);

  assert.deepEqual(entries, []);
  assert.deepEqual(notifications, []);
});
