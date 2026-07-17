# Voice Letter

Voice Letter is a skill for writing anything — cover letters, emails, posts, essays — in your own captured voice, and catching generic AI-sounding phrasing before it ships.

Voice capture is adaptive: paste writing samples if you have them, and/or answer a handful of short prompts in your own words (never self-reported style claims — the skill infers your voice from what you actually write). Drafting takes a goal, audience, and target length. Revision runs a voice-fidelity check plus an additive-risk scan against a layered, extensible blocklist of AI "tells."

## Repository Layout

```text
core/
  schemas/voice-profile.schema.json   # profile shape (v0.2.0)
  flows/
    capture-flow.md                   # build/update a profile: samples + elicitation
    draft-flow.md                     # draft anything from a profile
    revise-flow.md                    # voice fidelity + AI-tells pass
  elicitation-bank.md                 # interactive capture scenarios
  blocklist/
    ai-tells-baseline.md              # repo-maintained AI-giveaway patterns
    custom-terms.md                   # your own extensible additions
skills/voice-letter/SKILL.md          # Claude Code entry point
AGENTS.md                             # generic-harness entry point
.claude-plugin/                       # Claude Code plugin + self-hosted marketplace
.codex-plugin/                        # Codex plugin manifest
.agents/plugins/                      # self-hosted Codex marketplace manifest
docs/product-brief.md
examples/writing-samples.md
```

## Install

### Claude Code

```sh
claude plugin marketplace add https://github.com/commrelayunit/voice-letter
claude plugin install voice-letter@voice-letter
```

Use the HTTPS URL, not the `org/repo` shorthand — the shorthand clones over SSH and fails on machines without a configured GitHub SSH key.

### Codex

Add to your Codex plugin marketplace configuration (`~/.agents/plugins/marketplace.json` or project `.agents/plugins/marketplace.json`):

```json
{
  "name": "voice-letter",
  "source": { "source": "github", "repo": "commrelayunit/voice-letter" },
  "policy": { "installation": "AVAILABLE", "authentication": "NONE" },
  "category": "Writing"
}
```

This repo ships its own `.agents/plugins/marketplace.json`, so pointing Codex at a local clone works too:

```json
{
  "name": "voice-letter",
  "source": { "source": "local", "path": "~/plugins/voice-letter" },
  "policy": { "installation": "AVAILABLE", "authentication": "NONE" },
  "category": "Writing"
}
```

Manifest: `.codex-plugin/plugin.json` — instructions: `AGENTS.md`.

### Gemini CLI

```sh
mkdir -p ~/.gemini/skills/voice-letter
curl -o ~/.gemini/skills/voice-letter/SKILL.md \
  https://raw.githubusercontent.com/commrelayunit/voice-letter/main/skills/voice-letter/SKILL.md
```

### opencode

```sh
mkdir -p ~/.config/opencode/skills/voice-letter
curl -o ~/.config/opencode/skills/voice-letter/SKILL.md \
  https://raw.githubusercontent.com/commrelayunit/voice-letter/main/skills/voice-letter/SKILL.md
```

Restart opencode to load the skill.

### Cursor, Windsurf, Pi, and other generic harnesses

Copy `AGENTS.md` to your project root, or paste it into the tool's rules UI:

```sh
curl -O https://raw.githubusercontent.com/commrelayunit/voice-letter/main/AGENTS.md
```

### Any harness, manual

Reference the skill file directly:

```markdown
@path/to/voice-letter/skills/voice-letter/SKILL.md
```

## Quick Start

1. Ask the skill to capture (or update) a voice profile. Paste samples if you have them; answer the interactive prompts either way for anything samples couldn't confidently cover.
2. Ask it to draft something, giving a goal, audience, and target length.
3. Ask it to check the draft — it runs a voice-fidelity pass and an AI-tells pass, and reports a risk score with specific flags.

## Privacy Notes

Voice profiles and raw writing samples are never committed to this repo — they live at `~/.voice-letter/profiles/<name>.json`, outside any single agent's own config directory. Blocklist terms (`core/blocklist/`) are not sensitive and are intentionally git-tracked so they're shared and extensible.
