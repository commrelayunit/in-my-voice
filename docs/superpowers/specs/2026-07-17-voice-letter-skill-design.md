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
- Never store profiles, raw sources, or the global blocklist inside the git repo —
  they live under `~/.claude/voice-profiles/`, outside version control.

## Architecture

The repo is the dev source for a Claude Code Skill, installed at user level so
it's available in every project/session, not just this repo.

```text
voice-letter/
  skill/
    SKILL.md                          # orchestrator: modes, triggers, routing
    schemas/voice-profile.schema.json # generalized profile schema (v0.2.0)
    references/
      capture-flow.md                 # samples + adaptive elicitation logic
      elicitation-bank.md             # scenario prompts, tagged by trait
      draft-flow.md                   # general-purpose drafting
      revise-flow.md                  # fidelity + AI-tells pass
      ai-tells-checklist.md           # baseline, repo-maintained blocklist/patterns
  scripts/
    install.sh                        # symlinks skill/ into ~/.claude/skills/voice-letter
  docs/product-brief.md               # updated for general-purpose scope
  README.md                           # updated
  examples/writing-samples.md         # kept, genre-neutral
```

`prompts/01-03-*.md` and the old cover-letter-only schema are retired; their
logic is generalized into `skill/references/*`.

`scripts/install.sh` symlinks `skill/` to `~/.claude/skills/voice-letter` (falls
back to a copy if symlinking isn't possible), so edits in the repo take effect
immediately without reinstalling.

### Profile storage

Each named profile is a single JSON file at
`~/.claude/voice-profiles/<name>.json`. It embeds both the distilled traits
and a `sources` array (raw samples + elicited responses with provenance and
timestamps), so a later "update this profile" pass can see what's already
been asked/observed instead of starting over.

A user-maintained global blocklist lives at
`~/.claude/voice-profiles/_global-blocklist.md` — a plain, hand-editable list
of terms the person always wants flagged, applied across every profile.

## Capture Flow (`references/capture-flow.md`)

1. Ask which profile to build or update. If updating, load its existing
   `sources` and trait confidences first.
2. Ask whether the person has existing writing samples to paste.
3. If samples are provided, analyze them against the 8 trait dimensions
   (tone, sentenceRhythm, paragraphStructure, directness, evidenceStyle,
   transitions, lexicon, hedging), assigning per-trait confidence with
   evidence snippets.
4. Identify gaps: any trait at low/no confidence after sample analysis (or,
   with no samples, every trait).
5. For each gap, pull a matching scenario from `elicitation-bank.md` and ask
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

## Elicitation Bank (`references/elicitation-bank.md`)

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

## Draft Flow (`references/draft-flow.md`)

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

## Revise Flow (`references/revise-flow.md`)

Two passes over the draft:

1. **Voice-fidelity pass** — same as before: checks rhythm, paragraph
   structure, transitions, lexicon against the profile.
2. **AI-tells pass** — checks the draft against three merged layers of
   flagged terms/patterns:
   - baseline `ai-tells-checklist.md` (repo-maintained: stock phrases like
     "delve," "in today's fast-paced world," "testament to," "boasts,"
     "seamless," "leverage," "it's worth noting"; structural tics like
     rule-of-three lists, overly symmetric paragraph lengths, em-dash
     overuse, hedge-stacking "I believe/I think," suspiciously neat
     conclusions; and a sentence/paragraph-length variance check, since real
     human text is less uniform than typical LLM output)
   - the profile's own `customBlocklist` (per-profile, user-curated terms)
   - the global `~/.claude/voice-profiles/_global-blocklist.md` (user-curated,
     applies to all profiles)

Output: `revised_letter`, `change_log`, `remaining_risks`, and
`ai_tells_flagged` (which layer each flagged term/pattern came from).

## Schema Changes (`voice-profile.schema.json`, bump to 0.2.0)

- add required `profileName`
- keep the 8 `traits` dimensions unchanged (already genre-neutral)
- rename `draftingGuidance.coverLetterStrategy` → `draftingGuidance.strategyNotes`
- add `customBlocklist`: array of `{term, reason}` — per-profile, user-curated
  giveaway terms, distinct from the inferred `draftingGuidance.avoid`
- add `sources`: array of `{type: "sample" | "elicited", title, scenarioId?,
  date, text}` — raw provenance for future gap-aware updates
- add `sampleSummary.sources: {samples: n, elicited: n}` alongside the
  existing `sampleCount`/`confidence`

## SKILL.md (orchestrator)

Frontmatter `name: voice-letter`, with a description covering its trigger
conditions: capturing/updating a personal voice profile, drafting anything in
that voice given a goal and length, or checking an existing draft for
generic/AI-sounding phrasing. Routes to `capture-flow.md`, `draft-flow.md`,
or `revise-flow.md` based on what the person is asking for, and always loads
the relevant profile JSON plus the three blocklist layers when revising.
