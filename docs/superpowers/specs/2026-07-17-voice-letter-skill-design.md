# Voice Letter → Claude Code Skill: Design

Date: 2026-07-17

## Goal

Turn this repo from a cover-letter-specific prompt pack into a general-purpose
"write in my voice" Claude Code Skill. The person supplies a writing goal and
target length; the skill drafts in a captured personal voice profile and
actively guards against generic AI-sounding phrasing ("giveaways").

Voice capture supports two inputs that combine adaptively:

1. Bulk writing samples (existing approach).
2. Interactive elicitation — the skill asks the person to actually write short
   responses to realistic scenarios, and infers traits from that text rather
   than from self-reported style claims.

Rule: if samples are supplied, analyze them first; only ask interactively for
traits that remain low-confidence after sample analysis. With zero samples,
every trait is a gap, so capture is fully interactive.

## Non-Goals (carried forward, extended)

- Do not impersonate a person deceptively.
- Do not fabricate experience, credentials, publications, grants, or personal history.
- Do not infer sensitive personal attributes from samples or elicited text.
- Do not overfit to quirks that make output awkward, unprofessional, or caricatured.
- Never store voice profiles or raw sources (samples, elicited text) inside
  the git repo — they live under `~/.claude/voice-profiles/`, outside version
  control. Blocklist terms are not sensitive and are intentionally
  git-tracked in `core/blocklist/`.

## Architecture

Split into an agent-agnostic **core** (flows, schema, elicitation bank,
blocklists — plain markdown/JSON, no tool-specific conventions) and a thin
**adapter** per coding agent. Claude Code is the only adapter built now, but
the split exists specifically so Cursor, Windsurf, opencode, Pi, and OpenAI
Codex adapters can be added later without touching the core logic — each
would just be a thin entry file in its own tool's convention (`.cursorrules`,
`AGENTS.md`, etc.) that points into the same `core/` flows.

```text
voice-letter/
  core/
    schemas/voice-profile.schema.json # generalized profile schema (v0.2.0)
    flows/
      capture-flow.md                 # samples + adaptive elicitation logic
      draft-flow.md                   # general-purpose drafting
      revise-flow.md                  # fidelity + AI-tells pass
    elicitation-bank.md               # scenario prompts, tagged by trait
    blocklist/
      ai-tells-baseline.md            # repo-maintained, general AI giveaways
      custom-terms.md                 # your own extensible list, git-tracked
  adapters/
    claude-code/
      voice-letter/
        SKILL.md                      # thin wrapper: frontmatter + routes into ../../../core/*
  scripts/
    install-claude-code.sh            # symlinks adapters/claude-code/voice-letter -> ~/.claude/skills/voice-letter
  docs/product-brief.md               # updated for general-purpose scope
  README.md                           # updated
  examples/writing-samples.md         # kept, genre-neutral
```

`prompts/01-03-*.md` and the old cover-letter-only schema are retired; their
logic is generalized into `core/*`. Nothing under `core/` references Claude
Code, SKILL.md frontmatter, or `~/.claude/...` paths — that's confined to
`adapters/claude-code/`.

`scripts/install-claude-code.sh` symlinks `adapters/claude-code/voice-letter`
to `~/.claude/skills/voice-letter` (falls back to a copy if symlinking isn't
possible), so edits in the repo take effect immediately without reinstalling.
Because it's a symlink, relative paths from `SKILL.md` up into `core/`
resolve normally on disk.

### Blocklist (three layers)

1. `core/blocklist/ai-tells-baseline.md` — repo-maintained, general
   AI-giveaway terms and structural patterns. Git-tracked, shared across
   every profile and every future adapter.
2. `core/blocklist/custom-terms.md` — your own extensible list of flagged
   terms, same format as the baseline. Git-tracked (it's just words, not
   sensitive), hand-edited directly, applies globally across every profile.
3. Per-profile `customBlocklist` field embedded in each profile's JSON —
   stays out of git since that file also holds raw personal writing samples.
   Layers on top of (1) and (2) for that specific voice.

The revise flow merges all three during the AI-tells pass.

### Profile storage

Each named profile is a single JSON file at
`~/.claude/voice-profiles/<name>.json`. It embeds both the distilled traits
and a `sources` array (raw samples + elicited responses with provenance and
timestamps), so a later "update this profile" pass can see what's already
been asked/observed instead of starting over. This file is never committed
to git.

## Capture Flow (`core/flows/capture-flow.md`)

1. Ask which profile to build or update. If updating, load its existing
   `sources` and trait confidences first.
2. Ask whether the person has existing writing samples to paste.
3. If samples are provided, analyze them against the 8 trait dimensions
   (tone, sentenceRhythm, paragraphStructure, directness, evidenceStyle,
   transitions, lexicon, hedging), assigning per-trait confidence with
   evidence snippets.
4. Identify gaps: any trait at low/no confidence after sample analysis (or,
   with no samples, every trait).
5. For each gap, pull a matching scenario from `core/elicitation-bank.md` and ask
   the person to write a short (2-5 sentence) response to a realistic
   situation, one scenario at a time. Their actual written response is the
   signal — not a self-report of their style.
6. Treat each elicited response as a new source; re-run trait inference
   including it.
7. A few direct questions remain acceptable where self-report is reliable
   (e.g., "any words/phrases you always use or specifically avoid?"), but
   tone/rhythm/structure claims always come from analyzing written text, never
   from self-report.
8. Merge everything into the profile. Show the person a summary before
   writing to `~/.claude/voice-profiles/<name>.json`.

## Elicitation Bank (`core/elicitation-bank.md`)

A maintained set of ~7-8 scenario prompts, each tagged with the trait(s) it
surfaces. Baseline set:

| Scenario | Primary trait(s) |
|---|---|
| Tell a friend about a recent win (3-4 sentences) | tone, warmth |
| Decline a request from a colleague you like (2-3 sentences) | directness |
| Explain a decision you're confident about to someone skeptical | hedging, certainty |
| Convince someone using an example from your own experience | evidenceStyle |
| Compare two options and say which you'd pick and why | rhetorical contrast |
| How do you open/close an email to someone you don't know well? | greeting/sign-off convention |
| Describe a mistake you made and what you did about it | directness, hedging |

Rhythm, paragraph shape, transitions, and lexicon are inferred passively from
all collected text (samples + elicited responses combined), never asked about
directly.

## Draft Flow (`core/flows/draft-flow.md`)

Generalizes the old cover-letter-only drafting prompt. Inputs:

- `VOICE_PROFILE_JSON` (loaded by profile name)
- `WRITING_GOAL` — what this piece is and why (cover letter, email, LinkedIn
  post, essay, etc.)
- `AUDIENCE`
- `TARGET_LENGTH` — word count, paragraph count, or informal ("fits a text
  message")
- `CONTEXT_MATERIAL` (optional) — CV, notes, background, prior thread
- `CONSTRAINTS` — format, required points, deadline, tone adjustments

Same non-fabrication rules as before, generalized beyond cover letters.
Output: `draft`, `evidence_map` (only if context material was supplied),
`uncertainties`, `voice_fidelity_notes`.

## Revise Flow (`core/flows/revise-flow.md`)

Two passes over the draft:

1. **Voice-fidelity pass** — same as before: checks rhythm, paragraph
   structure, transitions, lexicon against the profile.
2. **AI-tells pass** — checks the draft against the three blocklist layers
   described above:
   - `core/blocklist/ai-tells-baseline.md` (repo-maintained: stock phrases
     like "delve," "in today's fast-paced world," "testament to," "boasts,"
     "seamless," "leverage," "it's worth noting"; structural tics like
     rule-of-three lists, overly symmetric paragraph lengths, em-dash
     overuse, hedge-stacking "I believe/I think," suspiciously neat
     conclusions; and a sentence/paragraph-length variance check, since real
     human text is less uniform than typical LLM output)
   - `core/blocklist/custom-terms.md` (your own git-tracked additions, applies globally)
   - the active profile's `customBlocklist` field (per-profile additions)

Output: `revised_letter`, `change_log`, `remaining_risks`, and
`ai_tells_flagged` (which layer each flagged term/pattern came from).

## Schema Changes (`core/schemas/voice-profile.schema.json`, bump to 0.2.0)

- add required `profileName`
- keep the 8 `traits` dimensions unchanged (already genre-neutral)
- rename `draftingGuidance.coverLetterStrategy` → `draftingGuidance.strategyNotes`
- add `customBlocklist`: array of `{term, reason}` — per-profile, user-curated
  giveaway terms, distinct from the inferred `draftingGuidance.avoid`
- add `sources`: array of `{type: "sample" | "elicited", title, scenarioId?,
  date, text}` — raw provenance for future gap-aware updates
- add `sampleSummary.sources: {samples: n, elicited: n}` alongside the
  existing `sampleCount`/`confidence`

## SKILL.md (Claude Code adapter, `adapters/claude-code/voice-letter/SKILL.md`)

A thin wrapper: frontmatter `name: voice-letter` with a description covering
its trigger conditions (capturing/updating a personal voice profile, drafting
anything in that voice given a goal and length, or checking an existing draft
for generic/AI-sounding phrasing). The body routes to `core/flows/capture-flow.md`,
`core/flows/draft-flow.md`, or `core/flows/revise-flow.md` based on what the
person is asking for, and always loads the relevant profile JSON plus the
three blocklist layers when revising. It contains no logic of its own beyond
routing and the Claude Code-specific conventions (frontmatter, `~/.claude/skills`
install location) — everything else lives in `core/`.

## Future Adapters (not built now)

The same `core/` content should work for other coding agents with only a new
thin entry file per tool: e.g. `adapters/cursor/.cursorrules`, an
`adapters/codex/AGENTS.md`, or equivalents for Windsurf, opencode, and Pi.
Each would state the same trigger conditions in that tool's convention and
point into the identical `core/flows/*`, `core/blocklist/*`, and
`core/schemas/voice-profile.schema.json`. None of this is scoped for this
implementation pass — it's the reason `core/` stays tool-agnostic now.
