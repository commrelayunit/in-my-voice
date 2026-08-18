# Pi Extension Plan

Status: first command-driven package surface implemented in `src/index.ts`.

In My Voice already supports Claude Code, Codex, Gemini CLI, opencode, and generic rule-loading harnesses through `skills/in-my-voice/SKILL.md` and `AGENTS.md`. A Pi package should be a real extension, not just a copied rules file, because Pi can expose commands, model selection, session entries, and project/global configuration.

## Reference

The useful reference shape is `wtfzambo/speak-like-you-eat`:

- `package.json` declares `pi.extensions: ["./src/index.ts"]`.
- The extension registers `/slye model|on|off`.
- It stores minimal global/project configuration.
- It runs an isolated secondary model request after eligible responses.
- It appends a display-only companion entry and leaves the original answer unchanged.
- It fails open on cancellation, timeout, provider failure, or malformed output.

## Recommended In My Voice Pi Surface

Start with a command-driven extension, not passive rewriting.

Passive post-response rewriting would mostly duplicate SLYE and can surprise users by sending every eligible answer to a second model. In My Voice has different semantics: it needs a profile, a writing goal, optional evidence, and a clear choice between capture, draft, and revise.

Recommended first commands:

```text
/imv profile
/imv capture
/imv organize
/imv draft
/imv revise
```

Expected behavior:

- `/imv profile` selects a profile from `~/.in-my-voice/profiles/` and stores only the selected profile name in Pi config.
- `/imv capture` opens or prints the guided setup/capture flow and writes profiles only to `~/.in-my-voice/profiles/`.
- `/imv organize` runs the sample-organization flow over a supplied inventory.
- `/imv draft` asks for writing goal, audience, target length, and context material, then drafts from the selected profile.
- `/imv revise` revises supplied text against the selected profile and the layered blocklist.

## Optional Later Companion Mode

A passive companion mode can be added later only if it is explicitly enabled:

```text
/imv companion on|off
```

If implemented, it should:

- rewrite only eligible final assistant prose
- never rewrite tool calls, tool results, errors, truncated responses, or fenced code blocks
- preserve target language and intentional language mix
- preserve facts, names, numbers, paths, URLs, commands, Markdown, and fenced code
- append a display-only entry such as `In My Voice check:` rather than changing the original
- fail open after timeout/cancellation/provider failure
- keep the request isolated from full session history, project files, tools, and private profile contents not needed for the selected operation

## Minimal Package Shape

If the repo becomes a Pi package, add a `package.json` with:

```json
{
  "name": "in-my-voice",
  "type": "module",
  "pi": {
    "extensions": ["./src/pi-extension.ts"]
  },
  "files": [
    "src",
    "core",
    "skills",
    "AGENTS.md",
    "README.md",
    "LICENSE"
  ],
  "peerDependencies": {
    "@earendil-works/pi-coding-agent": "*",
    "@earendil-works/pi-tui": "*"
  }
}
```

Do not add this until the extension code can be tested with Pi locally. A package manifest without a working `src/pi-extension.ts` is worse than no Pi package.

## Implementation Notes

- Keep profile storage agent-neutral: `~/.in-my-voice/profiles/<name>.json`.
- Keep Pi config small: enabled state, selected profile name, maybe selected secondary model if companion mode exists.
- Do not store raw writing samples in Pi config.
- Do not load full project context or hidden tool transcripts into secondary revision calls.
- Prefer command-driven explicit user actions for cost-bearing model calls.
- Reuse `core/flows/*.md` and `core/blocklist/*.md` as the authoritative behavior; the Pi extension should adapt those flows, not fork them.
