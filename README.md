# In My Voice

In My Voice is a skill for writing anything — cover letters, emails, posts, essays — in your own captured voice, and catching generic AI-sounding phrasing before it ships.

Voice capture is adaptive: paste writing samples if you have them, and/or answer a handful of short prompts in your own words (never self-reported style claims — the skill infers your voice from what you actually write). Profiles can organize samples into context paths such as `academic/paper/abstract`, `email/formal/follow-up`, or `social/messenger/coordination`, so drafting and revision use the relevant voice slice instead of averaging unrelated writing. Drafting takes a goal, audience, and target length. Revision runs a voice-fidelity check plus an additive-risk scan against a layered, extensible blocklist of AI "tells."

## Repository Layout

```text
core/
  schemas/voice-profile.schema.json   # profile shape (v0.2.0)
  flows/
    capture-flow.md                   # build/update a profile: samples + elicitation
    organize-samples-flow.md          # plan/audit profile sample hierarchy
    guided-profile-setup-flow.md      # first-run setup: hierarchy + capture + validation
    draft-flow.md                     # draft anything from a profile
    revise-flow.md                    # voice fidelity + AI-tells pass
  elicitation-bank.md                 # interactive capture scenarios
  blocklist/
    ai-tells-baseline.md              # repo-maintained AI-giveaway patterns
    custom-terms.md                   # your own extensible additions
skills/in-my-voice/SKILL.md           # Claude Code entry point
AGENTS.md                             # generic-harness entry point
.claude-plugin/                       # Claude Code plugin + self-hosted marketplace
.codex-plugin/                        # Codex plugin manifest
.agents/plugins/                      # self-hosted Codex marketplace manifest
examples/writing-samples.md
```

## Install

### Claude Code

```sh
claude plugin marketplace add https://github.com/commrelayunit/in-my-voice
claude plugin install in-my-voice@in-my-voice
```

Use the HTTPS URL, not the `org/repo` shorthand — the shorthand clones over SSH and fails on machines without a configured GitHub SSH key.

### Codex

For headless Codex CLI, use the installer:

```sh
curl -fsSL https://raw.githubusercontent.com/commrelayunit/in-my-voice/main/scripts/install-codex.sh | bash
```

It clones or updates the repo at `~/plugins/in-my-voice` and symlinks the skill into `${CODEX_HOME:-$HOME/.codex}/skills/in-my-voice`.

If Codex plugin marketplaces are available in your surface, you can also install it as a personal Codex plugin by cloning the repo under `~/plugins/`:

```sh
mkdir -p ~/plugins ~/.agents/plugins
git clone https://github.com/commrelayunit/in-my-voice.git ~/plugins/in-my-voice
```

Then add this entry to `~/.agents/plugins/marketplace.json`:

```json
{
  "name": "local",
  "interface": {
    "displayName": "Local Plugins"
  },
  "plugins": [
    {
      "name": "in-my-voice",
      "source": {
        "source": "local",
        "path": "./plugins/in-my-voice"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_USE"
      },
      "category": "Writing"
    }
  ]
}
```

If you already have a personal marketplace file, append only the `plugins[]` entry. Restart Codex after changing marketplace configuration.

Manifest: `.codex-plugin/plugin.json` — instructions: `AGENTS.md`.

Manual headless Codex CLI install:

```sh
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s ~/plugins/in-my-voice/skills/in-my-voice "${CODEX_HOME:-$HOME/.codex}/skills/in-my-voice"
```

The symlink keeps `skills/in-my-voice/SKILL.md`'s `../../core/...` references resolving against the cloned repo.

### Gemini CLI

This skill's entry file depends on the rest of the repo (`core/flows/`, `core/schemas/`, `core/blocklist/`) via relative paths, so a single-file copy won't work. Clone the full repo and point Gemini CLI at the real path:

```sh
git clone https://github.com/commrelayunit/in-my-voice.git ~/tools/in-my-voice
mkdir -p ~/.gemini/skills
ln -s ~/tools/in-my-voice/skills/in-my-voice ~/.gemini/skills/in-my-voice
```

(A symlink keeps `skills/in-my-voice/SKILL.md`'s `../../core/...` paths resolving correctly, since they resolve relative to the real location in `~/tools/in-my-voice`.)

### opencode

Same dependency on `core/` as above — clone the full repo and symlink the skill into place:

```sh
git clone https://github.com/commrelayunit/in-my-voice.git ~/tools/in-my-voice
mkdir -p ~/.config/opencode/skills
ln -s ~/tools/in-my-voice/skills/in-my-voice ~/.config/opencode/skills/in-my-voice
```

Restart opencode to load the skill.

### Cursor, Windsurf, Pi, and other generic harnesses

`AGENTS.md` also depends on the rest of the repo via relative paths (`core/flows/...`) — don't copy it alone. Clone the full repo, then point your tool's rules config at the real `AGENTS.md` path inside the clone:

```sh
git clone https://github.com/commrelayunit/in-my-voice.git ~/tools/in-my-voice
```

Then reference `~/tools/in-my-voice/AGENTS.md` from your tool's rules UI, or symlink the whole clone (not just the file) into your project if your tool expects `AGENTS.md` at the project root — symlinking `AGENTS.md` alone breaks its relative paths into `core/`:

```sh
ln -s ~/tools/in-my-voice ./in-my-voice-tools
```

Then point your tool's rules config at `./in-my-voice-tools/AGENTS.md`.

### Any harness, manual

Reference the skill file directly:

```markdown
@path/to/in-my-voice/skills/in-my-voice/SKILL.md
```

## Quick Start

1. First run: ask "build my voice profile" or "walk me through setting this up." The guided setup proposes a small hierarchy, captures available samples, validates the profile, and runs a short test draft.
2. To prepare samples first, ask "organize my writing samples for a work profile." The organization flow can work from a rough inventory and returns a reusable capture plan.
3. Ask the skill to capture (or update) a voice profile. Paste samples if you have them; answer the interactive prompts either way for anything samples couldn't confidently cover.
4. Ask it to draft something, giving a goal, audience, and target length. Mixed profiles use the closest context slice by default.
5. Ask it to check the draft — it runs a voice-fidelity pass against the relevant context and an AI-tells pass with a risk score.

Example invocations:

```text
Build my voice profile for academic abstracts and formal research emails.
Organize these sample titles into a voice profile taxonomy: two abstracts, one reviewer response, three formal follow-up emails, and a few short chat replies.
Draft a formal follow-up email using my work profile.
Check this LinkedIn post against my profile for generic AI-sounding phrasing.
```

## Profile Hierarchy

The profile schema remains `version: "0.2.0"` and existing flat profiles still validate. New profiles may add optional hierarchy fields:

- `sources[].samplePath` records where each sample belongs.
- `sampleSummary.hierarchy` summarizes sample counts and confidence per path.
- `contextSlices` stores context-specific trait and drafting guidance overrides.

When updating an older flat profile, classify existing sources only with user confirmation. Otherwise leave them as global evidence and note the migration gap in `sampleSummary.hierarchyNotes`.

## Privacy Notes

Voice profiles and raw writing samples are never committed to this repo — they live at `~/.in-my-voice/profiles/<name>.json`, outside any single agent's own config directory. Blocklist terms (`core/blocklist/`) are not sensitive and are intentionally git-tracked so they're shared and extensible.
