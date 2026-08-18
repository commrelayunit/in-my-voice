import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  type ExtensionAPI,
  type ExtensionCommandContext,
  getAgentDir,
  getMarkdownTheme,
} from "@earendil-works/pi-coding-agent";
import { Box, Markdown, Text } from "@earendil-works/pi-tui";
import { CONFIG_FILENAME, readConfig, writeConfigAtomically } from "./config.ts";
import { getProfileDirectory, listProfileNames } from "./profiles.ts";

const USAGE = "Usage: /imv profile [name]|capture|organize|draft|revise";
const ENTRY_TYPE = "in-my-voice.flow";
const FLOW_COMMANDS = ["capture", "organize", "draft", "revise"] as const;
const COMMANDS = ["profile", ...FLOW_COMMANDS] as const;

type FlowCommand = (typeof FLOW_COMMANDS)[number];
type FlowEntryData = {
  title: string;
  markdown: string;
};

const FLOW_DOCS: Record<FlowCommand, { title: string; path: string }> = {
  capture: { title: "In My Voice Capture Flow", path: "capture-flow.md" },
  organize: { title: "In My Voice Sample Organization Flow", path: "organize-samples-flow.md" },
  draft: { title: "In My Voice Draft Flow", path: "draft-flow.md" },
  revise: { title: "In My Voice Revision Flow", path: "revise-flow.md" },
};

export default function inMyVoice(pi: ExtensionAPI): void {
  pi.registerEntryRenderer<FlowEntryData>(ENTRY_TYPE, (entry, _options, theme) => {
    const data = parseFlowEntryData(entry.data);
    if (data === undefined) {
      return undefined;
    }

    const box = new Box(1, 1, (text) => theme.bg("customMessageBg", text));
    box.addChild(new Text(theme.bold(data.title), 0, 0));
    box.addChild(new Markdown(data.markdown, 0, 1, getMarkdownTheme()));
    return box;
  });

  pi.registerCommand("imv", {
    description: "Use In My Voice writing workflows",
    getArgumentCompletions: (prefix) => {
      const trimmedPrefix = prefix.trimStart();
      if (trimmedPrefix.includes(" ")) {
        return null;
      }

      const matches = COMMANDS.filter((command) => command.startsWith(trimmedPrefix));
      return matches.length === 0 ? null : matches.map((value) => ({ value, label: value }));
    },
    handler: async (args, ctx) => {
      if (ctx.mode !== "tui") {
        return;
      }

      const [command, ...rest] = args.trim().split(/\s+/).filter(Boolean);
      if (command === undefined) {
        ctx.ui.notify(USAGE, "info");
        return;
      }

      if (command === "profile") {
        await handleProfileCommand(rest.join(" "), ctx);
        return;
      }

      if (isFlowCommand(command)) {
        await showFlow(command, ctx, pi);
        return;
      }

      ctx.ui.notify(USAGE, "info");
    },
  });
}

async function handleProfileCommand(requestedProfile: string, ctx: ExtensionCommandContext): Promise<void> {
  const configPath = getGlobalConfigPath();
  const profiles = await listProfileNames();
  const current = await readConfig(configPath);
  if (current.kind === "invalid") {
    ctx.ui.notify(`In My Voice configuration is invalid at ${configPath}. It was not changed.`, "warning");
    return;
  }

  if (requestedProfile.trim() !== "") {
    await selectProfile(requestedProfile.trim(), profiles, ctx, configPath);
    return;
  }

  const selected = current.kind === "valid" ? current.config.selectedProfile : undefined;
  if (profiles.length === 0) {
    const profileDirectory = getProfileDirectory();
    const suffix = selected === undefined ? "" : ` Current selection: ${selected}.`;
    ctx.ui.notify(`No In My Voice profiles found in ${profileDirectory}.${suffix}`, "info");
    return;
  }

  const selectedProfile = await ctx.ui.select("Select In My Voice profile", profiles);
  if (selectedProfile === undefined) {
    return;
  }

  await selectProfile(selectedProfile, profiles, ctx, configPath);
}

async function selectProfile(
  profile: string,
  profiles: string[],
  ctx: ExtensionCommandContext,
  configPath: string,
): Promise<void> {
  if (!profiles.includes(profile)) {
    ctx.ui.notify(`Profile "${profile}" was not found in ${getProfileDirectory()}.`, "warning");
    return;
  }

  try {
    await writeConfigAtomically(configPath, { selectedProfile: profile });
  } catch {
    ctx.ui.notify("Could not save In My Voice configuration.", "warning");
    return;
  }

  ctx.ui.notify(`In My Voice profile selected: ${profile}.`, "info");
}

async function showFlow(command: FlowCommand, ctx: ExtensionCommandContext, pi: ExtensionAPI): Promise<void> {
  const flow = FLOW_DOCS[command];
  const profile = await getSelectedProfile();
  let markdown: string;
  try {
    markdown = await readFlowMarkdown(flow.path);
  } catch {
    ctx.ui.notify(`Could not load core/flows/${flow.path}.`, "warning");
    return;
  }

  const profileLine =
    profile === undefined
      ? "Selected profile: none. Run `/imv profile` to select one before drafting or revising."
      : `Selected profile: \`${profile}\`.`;

  pi.appendEntry<FlowEntryData>(ENTRY_TYPE, {
    title: flow.title,
    markdown: `${profileLine}\n\nAuthoritative source: \`core/flows/${flow.path}\`.\n\n${markdown}`,
  });
}

async function getSelectedProfile(): Promise<string | undefined> {
  const config = await readConfig(getGlobalConfigPath());
  return config.kind === "valid" ? config.config.selectedProfile : undefined;
}

async function readFlowMarkdown(flowPath: string): Promise<string> {
  return readFile(new URL(`../core/flows/${flowPath}`, import.meta.url), "utf8");
}

function getGlobalConfigPath(): string {
  return join(getAgentDir(), CONFIG_FILENAME);
}

function isFlowCommand(command: string): command is FlowCommand {
  return FLOW_COMMANDS.some((flowCommand) => flowCommand === command);
}

function parseFlowEntryData(data: unknown): FlowEntryData | undefined {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return undefined;
  }
  if (!("title" in data) || typeof data.title !== "string") {
    return undefined;
  }
  if (!("markdown" in data) || typeof data.markdown !== "string") {
    return undefined;
  }

  return { title: data.title, markdown: data.markdown };
}
