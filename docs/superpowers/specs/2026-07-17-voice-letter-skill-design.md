# Voice Letter → Multi-Agent Voice-Writing Skill: Design

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
  the git repo — they live under `~/.voice-letter/profiles/`, outside version
  control and independent of any single agent's own config directory (so it
  works the same whether you're using Claude Code, Codex, or another agent).
  Blocklist terms are not sensitive and are intentionally git-tracked in
  `core/blocklist/`.

## Architecture

Follows the packaging pattern used by `refhub-skill` / `refhub-paper-drafter`
(both general-purpose, multi-agent skill repos): deep reference material
lives once in `core/` (schema, elicitation bank, blocklists, flow specifics —
plain markdown/JSON, no tool-specific conventions), and each target agent
gets its own entry document that contains the actual routing/operating
instructions and points into `core/` for the rest. Claude Code and Codex get
full plugin packaging now; other agents get a generic `AGENTS.md` plus a
documented manual-install path.

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
  skills/
    voice-letter/
      SKILL.md                        # Claude Code canonical skill: frontmatter + routing/operating instructions + pointers into core/
  AGENTS.md                           # generic-harness instructions (Cursor, Windsurf, Pi, opencode, Gemini CLI): same routing/operating content as SKILL.md, no frontmatter, points into core/
  .claude-plugin/
    plugin.json                       # Claude Code plugin manifest {name, description, version, author, homepage, skills: ["./skills/voice-letter"]}
    marketplace.json                  # self-hosted marketplace so `claude plugin marketplace add <this-repo>` works directly
  .codex-plugin/
    plugin.json                       # Codex plugin manifest {name, version, description, skills: "./skills/", author}
  .agents/
    plugins/
      marketplace.json                # self-hosted Codex-style marketplace manifest
  CHANGELOG.md                        # Keep a Changelog format, semver
  docs/product-brief.md               # updated for general-purpose scope
  README.md                           # updated, with an install section per target agent
  examples/writing-samples.md         # kept, genre-neutral
```

`prompts/01-03-*.md` and the old cover-letter-only schema are retired; their
logic is generalized into `core/*`. `core/` itself references nothing
Claude- or Codex-specific — only `skills/voice-letter/SKILL.md`,
`.claude-plugin/`, and `.codex-plugin/` do.

SKILL.md and AGENTS.md are expected to be manually kept in sync on their
shared framing (same lesson as refhub's CHANGELOG, which calls this out as a
recurring chore) — but neither duplicates the large tables/banks in `core/`;
both just point to them, the same way this session's own `brainstorming`
skill loads `references/*.md` on demand rather than inlining them.

### Install paths (README, mirrors refhub)

- **Claude Code**: `claude plugin marketplace add https://github.com/commrelayunit/voice-letter` then `claude plugin install voice-letter@voice-letter`. Use the HTTPS URL, not the `org/repo` shorthand — the shorthand clones over SSH and fails without a configured GitHub SSH key.
- **Codex**: add a marketplace entry pointing at `github: commrelayunit/voice-letter` (or a local clone path) referencing `.codex-plugin/plugin.json`; instructions come from `AGENTS.md`.
- **Gemini CLI / opencode**: `cp -r skills/voice-letter ~/.gemini/skills/` or `~/.config/opencode/skills/` respectively.
- **Cursor / Windsurf / Pi / other generic harnesses**: copy `AGENTS.md` into the project root, or paste it into the tool's rules UI.
- **Any harness, manual**: reference `skills/voice-letter/SKILL.md` directly by path.

No CLI layer is needed (unlike refhub) — voice-letter has no external API;
its only I/O is reading/writing local profile JSON files, which every one of
these agents can already do with its own file tools.

### Blocklist (three layers, additive-risk model)

1. `core/blocklist/ai-tells-baseline.md` — repo-maintained, general
   AI-giveaway terms and structural patterns. Git-tracked, shared across
   every profile and every future adapter. **Seeded from the existing
   `generated-text-giveaways.md` draft at the repo root** (moved into place
   during implementation), which already defines the model this design
   adopts wholesale rather than reinventing:
   - six categories, broad to narrow: (1) document/paragraph flow, (2)
     paragraph-level rhetorical moves, (3) sentence structure/rhythm, (4)
     phrase templates, (5) claims/trait words, (6) individual words
   - each pattern tagged **hard block** (replaces evidence with an
     unsupported claim), **soft warning** (generic/over-polished but
     context-dependent), or **style review** (only suspicious if repeated or
     voice-mismatched), each with a stated false-positive risk
   - evidence exceptions: don't flag a phrase that appears naturally in the
     author's own samples unless it's still weakening the piece; reduce risk
     when the sentence has concrete evidence (named project, metric, result,
     etc.); increase risk when a paragraph has none
   - an additive severity score (+3 unevidenced hard-block phrase, +2
     soft-warning in opener/closer/topic sentence, +2 evidence-free body
     paragraph, +1 repeated template, -2 phrase matches the profile's
     `draftingGuidance.prefer`, -2 sentence has concrete evidence) against
     thresholds (0-2 no issue, 3-5 style review, 6-8 revise before final, 9+
     regenerate / run a focused evidence-grounding pass)
2. `core/blocklist/custom-terms.md` — your own extensible list of flagged
   terms, same category/severity/evidence-exception format as the baseline.
   Git-tracked (it's just words, not sensitive), hand-edited directly,
   applies globally across every profile.
3. Per-profile `customBlocklist` field embedded in each profile's JSON —
   stays out of git since that file also holds raw personal writing samples.
   Layers on top of (1) and (2) for that specific voice.

**Genre scoping**: categories 1 (document/paragraph flow) and the
cover-letter-opener/career-summary-wrapper patterns in category 4 are
application-genre-specific — they'd misfire on a casual email or a social
post. They apply only when `WRITING_GOAL` (from the draft flow) is an
application/persuasive genre. Categories 2, 3, 5, and 6 (rhetorical moves,
sentence rhythm, trait words, individual words) are genre-agnostic and always
apply.

The revise flow merges all three layers and runs the additive-risk scoring
during the AI-tells pass.

### Profile storage

Each named profile is a single JSON file at
`~/.voice-letter/profiles/<name>.json` — deliberately outside any one agent's
own config directory, so the same profile is usable whether you're in Claude
Code, Codex, or another agent. It embeds both the distilled traits and a
`sources` array (raw samples + elicited responses with provenance and
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
   writing to `~/.voice-letter/profiles/<name>.json`.

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
2. **AI-tells pass** — runs the additive-risk model from the "Blocklist"
   section above across all three layers, broad to narrow (document/paragraph
   flow → rhetorical moves → sentence rhythm → phrase templates → trait words
   → individual words), applying genre scoping and evidence exceptions, and
   computes the total score against the 0-2 / 3-5 / 6-8 / 9+ thresholds.

Output: `revised_letter`, `change_log`, `remaining_risks`, and
`ai_tells_flagged` — a list of `{category, pattern, layer, severity, score,
rationale}` plus the total score and its threshold band.

## Schema Changes (`core/schemas/voice-profile.schema.json`, bump to 0.2.0)

- add required `profileName`
- keep the 8 `traits` dimensions unchanged (already genre-neutral)
- rename `draftingGuidance.coverLetterStrategy` → `draftingGuidance.strategyNotes`
- add `customBlocklist`: array of `{term, severity: "hard" | "soft" |
  "style", reason}` — per-profile, user-curated giveaway terms in the same
  severity model as `core/blocklist/ai-tells-baseline.md`, distinct from the
  inferred `draftingGuidance.avoid`
- add `sources`: array of `{type: "sample" | "elicited", title, scenarioId?,
  date, text}` — raw provenance for future gap-aware updates
- add `sampleSummary.sources: {samples: n, elicited: n}` alongside the
  existing `sampleCount`/`confidence`

## SKILL.md (`skills/voice-letter/SKILL.md`) and AGENTS.md

`SKILL.md` carries Claude Code's frontmatter — `name: voice-letter` and a
`description` covering its trigger conditions (capturing/updating a personal
voice profile, drafting anything in that voice given a goal and length, or
checking an existing draft for generic/AI-sounding phrasing). Its body states
how to operate: route to `core/flows/capture-flow.md`, `core/flows/draft-flow.md`,
or `core/flows/revise-flow.md` based on what the person is asking for, and
always load the relevant profile JSON plus the three blocklist layers when
revising.

`AGENTS.md` at the repo root carries the same trigger conditions and routing
instructions, reformatted without Claude-specific frontmatter, for Cursor,
Windsurf, Pi, opencode, and Gemini CLI. It points into the same `core/` files
as SKILL.md. The two are kept in sync by hand on this top-level framing; the
large reference content they both point to is never duplicated.

## Packaging for Claude Code and Codex (built now)

- `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` make this
  repo directly installable as a self-hosted Claude Code plugin/marketplace
  (`claude plugin marketplace add` + `claude plugin install`).
- `.codex-plugin/plugin.json` + `.agents/plugins/marketplace.json` do the
  equivalent for Codex's marketplace convention, pointing at `AGENTS.md` for
  instructions.
- Gemini CLI, opencode, and other generic harnesses don't get dedicated
  plugin manifests (none of them have an established one) — they're covered
  by the skill-copy and `AGENTS.md` install paths documented in the README.

Nothing further is deferred to "future adapters": this covers every agent
named in scope. A genuinely new adapter format later (e.g. if Windsurf ships
its own plugin/marketplace convention) would just add another manifest
pointing at the same `core/` and `skills/voice-letter/SKILL.md` content.
