# Voice Letter Multi-Agent Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `voice-letter` from a cover-letter-only prompt pack into a general-purpose "write in my voice" skill, packaged so it installs into Claude Code, Codex, Gemini CLI, opencode, and generic agents (Cursor/Windsurf/Pi).

**Architecture:** Deep reference content (schema, elicitation bank, blocklists, flow instructions) lives once under `core/`. `skills/voice-letter/SKILL.md` (Claude Code) and `AGENTS.md` (generic harnesses) both carry routing/operating instructions and point into `core/` rather than duplicating it. `.claude-plugin/` and `.codex-plugin/` + `.agents/plugins/` make the repo self-hosting as a plugin marketplace for those two tools; other agents install via a documented skill-copy or `AGENTS.md` copy.

**Tech Stack:** Plain Markdown + JSON only. No runtime, no new dependencies. Verification uses `jq` (already on the system) for JSON validity/structural checks and `grep`/`test` for markdown content checks — there is no application code to unit-test with a framework, so "tests" in this plan are concrete, scriptable verification commands rather than a pytest suite.

## Global Constraints

- Profile schema version is `"0.2.0"` (const) — every fixture and profile must carry it.
- Profiles and raw sources are stored at `~/.voice-letter/profiles/<name>.json`, never inside the git repo, never inside any single agent's own config directory.
- Blocklist content (`core/blocklist/*`) is git-tracked — it is not sensitive.
- Repo is `commrelayunit/voice-letter` (matches `git remote -v` and the existing `LICENSE`).
- No new dependencies (no `jsonschema`, `ajv`, npm/pip packages) — this repo stays dependency-free.
- Non-goals (apply to every flow file written in this plan): do not impersonate a person deceptively; do not fabricate experience, credentials, publications, grants, or personal history; do not infer sensitive personal attributes from samples or elicited text; do not overfit to quirks that make output awkward, unprofessional, or caricatured.
- Spec: `docs/superpowers/specs/2026-07-17-voice-letter-skill-design.md` — every task below implements a section of it.

---

### Task 1: Retire the old cover-letter-only prompt pack

**Files:**
- Delete: `prompts/01-extract-voice-profile.md`
- Delete: `prompts/02-draft-cover-letter.md`
- Delete: `prompts/03-revise-for-fidelity.md`
- Delete: `schemas/voice-profile.schema.json`

**Interfaces:**
- Produces: a clean slate — no code references these paths going forward. Tasks 2–7 recreate generalized equivalents under `core/`.

- [ ] **Step 1: Remove the old prompt pack and schema**

```bash
git rm -r prompts/ schemas/
```

- [ ] **Step 2: Verify removal**

```bash
test ! -e prompts && test ! -e schemas && echo "OK: old paths gone"
```
Expected output: `OK: old paths gone`

- [ ] **Step 3: Commit**

```bash
git commit -m "Retire cover-letter-only prompt pack, superseded by core/ flows"
```

---

### Task 2: Voice profile schema v0.2.0 + fixtures

**Files:**
- Create: `core/schemas/voice-profile.schema.json`
- Create: `core/schemas/fixtures/valid-profile.json`
- Create: `core/schemas/fixtures/invalid-profile.json`

**Interfaces:**
- Produces: the `VoiceProfile` JSON shape every later flow (`capture-flow.md`, `draft-flow.md`, `revise-flow.md`) reads/writes. Required top-level keys: `profileName`, `version`, `sampleSummary`, `traits`, `draftingGuidance`, `examples`, `limits`, `customBlocklist`, `sources`. `traits` sub-keys (unchanged from v0.1.0): `tone`, `sentenceRhythm`, `paragraphStructure`, `directness`, `evidenceStyle`, `transitions`, `lexicon`, `hedging`. `draftingGuidance` sub-keys: `prefer`, `avoid`, `strategyNotes` (renamed from `coverLetterStrategy`). `customBlocklist` items: `{term, severity: "hard"|"soft"|"style", reason}`. `sources` items: `{type: "sample"|"elicited", title, scenarioId?, date, text}`.

- [ ] **Step 1: Write the invalid fixture (missing `profileName`)**

```json
{
  "version": "0.2.0",
  "sampleSummary": {
    "sampleCount": 1,
    "genres": ["email"],
    "confidence": "low",
    "sources": { "samples": 1, "elicited": 0 }
  },
  "traits": {
    "tone": { "description": "placeholder", "evidence": [], "confidence": "low" },
    "sentenceRhythm": { "description": "placeholder", "evidence": [], "confidence": "low" },
    "paragraphStructure": { "description": "placeholder", "evidence": [], "confidence": "low" },
    "directness": { "description": "placeholder", "evidence": [], "confidence": "low" },
    "evidenceStyle": { "description": "placeholder", "evidence": [], "confidence": "low" },
    "transitions": { "description": "placeholder", "evidence": [], "confidence": "low" },
    "lexicon": { "description": "placeholder", "evidence": [], "confidence": "low" },
    "hedging": { "description": "placeholder", "evidence": [], "confidence": "low" }
  },
  "draftingGuidance": { "prefer": [], "avoid": [], "strategyNotes": [] },
  "examples": [],
  "limits": [],
  "customBlocklist": [],
  "sources": []
}
```

- [ ] **Step 2: Write the jq structural check and confirm it fails on the invalid fixture**

```bash
jq -e '
  (.profileName != null) and
  (.version == "0.2.0") and
  (.traits | has("tone") and has("sentenceRhythm") and has("paragraphStructure") and has("directness") and has("evidenceStyle") and has("transitions") and has("lexicon") and has("hedging")) and
  (.draftingGuidance | has("prefer") and has("avoid") and has("strategyNotes")) and
  (.customBlocklist | type == "array") and
  (.sources | type == "array") and
  (.sampleSummary.sources | has("samples") and has("elicited"))
' core/schemas/fixtures/invalid-profile.json
```
Expected: `jq` prints `false` and exits non-zero (check with `echo $?` — expect `1`).

- [ ] **Step 3: Write the valid fixture**

```json
{
  "profileName": "default",
  "version": "0.2.0",
  "sampleSummary": {
    "sampleCount": 1,
    "genres": ["email"],
    "confidence": "medium",
    "notes": "Seed fixture for schema validation, not a real profile.",
    "sources": { "samples": 1, "elicited": 0 }
  },
  "traits": {
    "tone": { "description": "Warm but direct.", "evidence": ["Thanks for flagging this — I'll fix it today."], "confidence": "medium" },
    "sentenceRhythm": { "description": "Short declaratives mixed with one longer explanatory sentence per paragraph.", "evidence": ["It broke. Here's why, and here's the fix."], "confidence": "medium" },
    "paragraphStructure": { "description": "Two to three sentence paragraphs, one idea each.", "evidence": [], "confidence": "low" },
    "directness": { "description": "States the ask or the answer first, context after.", "evidence": ["No, I can't take this on this sprint."], "confidence": "high" },
    "evidenceStyle": { "description": "Backs claims with a specific example rather than a general statement.", "evidence": [], "confidence": "low" },
    "transitions": { "description": "Uses \"so\" and \"which means\" rather than \"furthermore\"/\"moreover\".", "evidence": [], "confidence": "medium" },
    "lexicon": { "description": "Plain word choices, avoids corporate jargon.", "evidence": [], "confidence": "medium" },
    "hedging": { "description": "States uncertainty plainly (\"not sure yet\") instead of stacking hedges.", "evidence": [], "confidence": "low" }
  },
  "draftingGuidance": {
    "prefer": ["short declarative openers", "concrete examples over general claims"],
    "avoid": ["corporate jargon", "stacked hedging"],
    "strategyNotes": ["Lead with the concrete match to the ask before any framing."]
  },
  "examples": [
    {
      "generic": "I am confident that my skills and experience make me a strong candidate.",
      "inVoice": "I've shipped three of these end to end, most recently the Q2 migration.",
      "rationale": "Replaces an unsupported confidence claim with a named, checkable result."
    }
  ],
  "limits": ["Do not fabricate employment history or credentials not present in the supplied sources."],
  "customBlocklist": [
    { "term": "synergy", "severity": "soft", "reason": "Never appears in any supplied sample; reads as corporate filler." }
  ],
  "sources": [
    { "type": "sample", "title": "Slack message to teammate", "date": "2026-06-02", "text": "No, I can't take this on this sprint. Happy to look at it next week if it's still open." }
  ]
}
```

- [ ] **Step 4: Run the jq check against the valid fixture and confirm it passes**

```bash
jq -e '
  (.profileName != null) and
  (.version == "0.2.0") and
  (.traits | has("tone") and has("sentenceRhythm") and has("paragraphStructure") and has("directness") and has("evidenceStyle") and has("transitions") and has("lexicon") and has("hedging")) and
  (.draftingGuidance | has("prefer") and has("avoid") and has("strategyNotes")) and
  (.customBlocklist | type == "array") and
  (.sources | type == "array") and
  (.sampleSummary.sources | has("samples") and has("elicited"))
' core/schemas/fixtures/valid-profile.json
```
Expected: `jq` prints `true` and exits `0`.

- [ ] **Step 5: Write the JSON Schema itself**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/commrelayunit/voice-letter/core/schemas/voice-profile.schema.json",
  "title": "VoiceProfile",
  "type": "object",
  "required": [
    "profileName",
    "version",
    "sampleSummary",
    "traits",
    "draftingGuidance",
    "examples",
    "limits",
    "customBlocklist",
    "sources"
  ],
  "additionalProperties": false,
  "properties": {
    "profileName": { "type": "string", "minLength": 1 },
    "version": { "type": "string", "const": "0.2.0" },
    "sampleSummary": {
      "type": "object",
      "required": ["sampleCount", "genres", "confidence", "sources"],
      "additionalProperties": false,
      "properties": {
        "sampleCount": { "type": "integer", "minimum": 0 },
        "genres": { "type": "array", "items": { "type": "string" } },
        "confidence": { "type": "string", "enum": ["low", "medium", "high"] },
        "notes": { "type": "string" },
        "sources": {
          "type": "object",
          "required": ["samples", "elicited"],
          "additionalProperties": false,
          "properties": {
            "samples": { "type": "integer", "minimum": 0 },
            "elicited": { "type": "integer", "minimum": 0 }
          }
        }
      }
    },
    "traits": {
      "type": "object",
      "required": [
        "tone", "sentenceRhythm", "paragraphStructure", "directness",
        "evidenceStyle", "transitions", "lexicon", "hedging"
      ],
      "additionalProperties": false,
      "properties": {
        "tone": { "$ref": "#/$defs/observedTrait" },
        "sentenceRhythm": { "$ref": "#/$defs/observedTrait" },
        "paragraphStructure": { "$ref": "#/$defs/observedTrait" },
        "directness": { "$ref": "#/$defs/observedTrait" },
        "evidenceStyle": { "$ref": "#/$defs/observedTrait" },
        "transitions": { "$ref": "#/$defs/observedTrait" },
        "lexicon": { "$ref": "#/$defs/observedTrait" },
        "hedging": { "$ref": "#/$defs/observedTrait" }
      }
    },
    "draftingGuidance": {
      "type": "object",
      "required": ["prefer", "avoid", "strategyNotes"],
      "additionalProperties": false,
      "properties": {
        "prefer": { "type": "array", "items": { "type": "string" } },
        "avoid": { "type": "array", "items": { "type": "string" } },
        "strategyNotes": { "type": "array", "items": { "type": "string" } }
      }
    },
    "examples": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["generic", "inVoice", "rationale"],
        "additionalProperties": false,
        "properties": {
          "generic": { "type": "string" },
          "inVoice": { "type": "string" },
          "rationale": { "type": "string" }
        }
      }
    },
    "limits": { "type": "array", "items": { "type": "string" } },
    "customBlocklist": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["term", "severity", "reason"],
        "additionalProperties": false,
        "properties": {
          "term": { "type": "string" },
          "severity": { "type": "string", "enum": ["hard", "soft", "style"] },
          "reason": { "type": "string" }
        }
      }
    },
    "sources": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["type", "title", "date", "text"],
        "additionalProperties": false,
        "properties": {
          "type": { "type": "string", "enum": ["sample", "elicited"] },
          "title": { "type": "string" },
          "scenarioId": { "type": "string" },
          "date": { "type": "string" },
          "text": { "type": "string" }
        }
      }
    }
  },
  "$defs": {
    "observedTrait": {
      "type": "object",
      "required": ["description", "evidence", "confidence"],
      "additionalProperties": false,
      "properties": {
        "description": { "type": "string" },
        "evidence": { "type": "array", "items": { "type": "string" } },
        "confidence": { "type": "string", "enum": ["low", "medium", "high"] }
      }
    }
  }
}
```

- [ ] **Step 6: Validate the schema file itself is well-formed JSON**

```bash
jq empty core/schemas/voice-profile.schema.json && echo "OK: schema is valid JSON"
```
Expected: `OK: schema is valid JSON`

- [ ] **Step 7: Re-run Step 4's check against the corrected valid fixture, and Step 2's check against the invalid one, one more time to confirm both still hold**

```bash
jq -e '(.profileName != null)' core/schemas/fixtures/invalid-profile.json; echo "invalid fixture profileName check exit: $?"
jq -e '(.profileName != null) and (.sampleSummary.sources.elicited != null)' core/schemas/fixtures/valid-profile.json; echo "valid fixture check exit: $?"
```
Expected: first exit `1`, second exit `0`.

- [ ] **Step 8: Commit**

```bash
git add core/schemas/
git commit -m "Add generalized voice-profile schema v0.2.0 with fixtures"
```

---

### Task 3: AI-tells baseline blocklist (seed from `generated-text-giveaways.md`) + custom-terms template

**Files:**
- Move: `generated-text-giveaways.md` → `core/blocklist/ai-tells-baseline.md`
- Modify: `core/blocklist/ai-tells-baseline.md` (post-move edits below)
- Create: `core/blocklist/custom-terms.md`

**Interfaces:**
- Produces: the baseline severity-scored blocklist (categories 1–6, additive scoring model in §7.1, prompt instruction in §7.2, compact list in §8) that `revise-flow.md` (Task 7) loads and runs. `custom-terms.md` establishes the same `{severity: hard|soft|style, term/pattern, reason}` shape for the user's own git-tracked additions.

- [ ] **Step 1: Move the file into place**

```bash
git mv generated-text-giveaways.md core/blocklist/ai-tells-baseline.md
```

- [ ] **Step 2: Verify the move**

```bash
test ! -e generated-text-giveaways.md && test -f core/blocklist/ai-tells-baseline.md && echo "OK: moved"
```
Expected: `OK: moved`

- [ ] **Step 3: Adapt the framing from cover-letter-only to genre-scoped general use**

Edit the file's opening (lines 1–9 in the original) from:
```markdown
# Generated Text Giveaways: Hierarchical Block List

Date: 2026-07-17

Project: `commrelayunit/voice-letter`

Purpose: structure generated-text giveaways from broadest to narrowest signal for use as a practical cover-letter lint/block list.

Important caveat: this is not an AI detector. Use these signals to catch generic, voice-breaking, or evidence-free prose. A human can write this way too, and a generated draft can avoid many of these signs.
```
to:
```markdown
# AI-Tells Baseline Blocklist

Date: 2026-07-17

Project: `commrelayunit/voice-letter`

Purpose: structure generated-text giveaways from broadest to narrowest signal, for use by `core/flows/revise-flow.md` as an additive-risk lint against any piece of writing — not only cover letters.

Important caveat: this is not an AI detector. Use these signals to catch generic, voice-breaking, or evidence-free prose. A human can write this way too, and a generated draft can avoid many of these signs.

**Genre scoping:** Section 1 ("Document And Paragraph Flow") and the cover-letter-opener / career-summary-wrapper patterns in §4.1–4.2 are application-genre-specific (cover letters, grant applications, "why hire me" posts). Skip them when `WRITING_GOAL` is not an application/persuasive genre — they will misfire on a casual email or social post. Sections 2, 3, 5, and 6 are genre-agnostic and always apply.
```

- [ ] **Step 4: Verify the edit landed**

```bash
grep -q "AI-Tells Baseline Blocklist" core/blocklist/ai-tells-baseline.md && \
grep -q "Genre scoping" core/blocklist/ai-tells-baseline.md && \
echo "OK: framing updated"
```
Expected: `OK: updated`

- [ ] **Step 5: Write the custom-terms template**

```markdown
# Custom Terms Blocklist

Your own extensible list of flagged terms/patterns, applied globally across every voice profile, on top of `core/blocklist/ai-tells-baseline.md`. Git-tracked — these are just words, not sensitive data.

Same severity model as the baseline: **hard** (replaces evidence with an unsupported claim), **soft** (generic/over-polished but context-dependent), **style** (only suspicious if repeated or voice-mismatched).

Add entries as you notice patterns the baseline misses. One per line, in this format:

```text
- severity: hard | soft | style
  term: <exact phrase or short pattern description>
  reason: <why this is a giveaway for you specifically>
```

## Entries

(none yet — add your own below this line)
```

- [ ] **Step 6: Verify the template exists with the required format markers**

```bash
grep -q "severity: hard | soft | style" core/blocklist/custom-terms.md && echo "OK: template written"
```
Expected: `OK: template written`

- [ ] **Step 7: Commit**

```bash
git add core/blocklist/
git commit -m "Move AI-tells blocklist into core/, genre-scope it, add custom-terms template"
```

---

### Task 4: Elicitation bank

**Files:**
- Create: `core/elicitation-bank.md`

**Interfaces:**
- Consumes: the 8 trait names from `core/schemas/voice-profile.schema.json` (Task 2).
- Produces: the scenario table `core/flows/capture-flow.md` (Task 5) reads when picking a scenario for a low-confidence trait.

- [ ] **Step 1: Write the elicitation bank**

```markdown
# Elicitation Bank

Scenario prompts used by `core/flows/capture-flow.md` to fill trait gaps that sample analysis couldn't confidently resolve. Ask one at a time, in the person's own words. Their actual written response is the signal — never take a self-reported style claim (e.g. "I'm pretty formal") at face value for tone/rhythm/structure traits.

| Scenario | Primary trait(s) |
|---|---|
| Tell a friend about a recent win, 3-4 sentences. | tone, warmth |
| Decline a request from a colleague you like, in 2-3 sentences. | directness |
| Explain a decision you're confident about to someone skeptical of it. | hedging, certainty |
| Convince someone of something using an example from your own experience. | evidenceStyle |
| Compare two options and say which you'd pick and why. | rhetorical contrast (feeds transitions/paragraphStructure) |
| How do you open and close an email to someone you don't know well? | greeting/sign-off convention (feeds tone, lexicon) |
| Describe a mistake you made and what you did about it. | directness, hedging |

Rhythm, paragraph shape, transitions, and lexicon are never asked about directly — infer them passively from all collected text (samples + every elicited response), the same way sample analysis does.

A few direct questions are acceptable exceptions, because self-report is reliable for these specifically:
- "Any words or phrases you always use, or specifically avoid?"
- "Any greeting/sign-off you always use?" (only if the open/close scenario above wasn't already answered)

Never ask direct questions for tone, directness, hedging, or evidence style — always elicit real text instead.
```

- [ ] **Step 2: Verify the required trait coverage**

```bash
for trait in tone directness hedging evidenceStyle; do
  grep -qi "$trait" core/elicitation-bank.md || { echo "MISSING: $trait"; exit 1; }
done
echo "OK: all core traits represented"
```
Expected: `OK: all core traits represented`

- [ ] **Step 3: Commit**

```bash
git add core/elicitation-bank.md
git commit -m "Add elicitation scenario bank for voice capture"
```

---

### Task 5: Capture flow

**Files:**
- Create: `core/flows/capture-flow.md`

**Interfaces:**
- Consumes: `core/schemas/voice-profile.schema.json` (Task 2, output shape), `core/elicitation-bank.md` (Task 4, scenario table).
- Produces: the process `skills/voice-letter/SKILL.md` (Task 8) and `AGENTS.md` (Task 9) route to for "capture or update a profile." Writes profile JSON to `~/.voice-letter/profiles/<name>.json`.

- [ ] **Step 1: Write the capture flow**

```markdown
# Flow: Capture Or Update A Voice Profile

You are building or updating a structured voice profile so future drafts sound like the author, not like a template. Describe how the author writes, not what they believe. Do not infer sensitive personal attributes, diagnose personality, or invent biography. Ground every trait in supplied evidence.

## Step 1: Identify the profile

Ask which named profile to build or update (e.g. "work", "personal"). If it already exists at `~/.voice-letter/profiles/<name>.json`, load it — you'll extend its `sources` and `traits`, not start over.

## Step 2: Collect samples (if any)

Ask whether the person has existing writing to paste (emails, docs, posts, notes). This is optional — if they have none, skip straight to Step 4 with every trait treated as a gap.

For each sample, capture: title/context, audience, rough date, and the text itself. Append each as a `sources` entry with `"type": "sample"`.

## Step 3: Analyze samples against the trait schema

Analyze all collected samples against the 8 trait dimensions in `core/schemas/voice-profile.schema.json`: `tone`, `sentenceRhythm`, `paragraphStructure`, `directness`, `evidenceStyle`, `transitions`, `lexicon`, `hedging`. For each, write a `description`, cite short `evidence` snippets from the samples, and assign `confidence`: `low`, `medium`, or `high`. If evidence is thin, mark confidence low rather than guessing.

## Step 4: Identify gaps

Any trait at `low` confidence (or with no evidence at all) is a gap. With zero samples, every trait is a gap.

## Step 5: Fill gaps interactively

For each gap, pick a matching scenario from `core/elicitation-bank.md` and ask the person to write a short (2-5 sentence) response, one scenario at a time. Do not ask them to describe their style — ask them to actually write something realistic, and infer the trait from what they wrote.

Append each response as a `sources` entry with `"type": "elicited"` and the matching `scenarioId`.

A few direct questions are fine where self-report is reliable (see the exceptions listed in `core/elicitation-bank.md`) — but never for tone, directness, hedging, or evidence style.

## Step 6: Re-run trait inference

Re-analyze all traits, now including the elicited responses alongside the samples. Confidence should generally rise for traits that were gaps.

## Step 7: Build drafting guidance and examples

From everything collected, fill in:
- `draftingGuidance.prefer` — words/phrases/moves this person actually uses
- `draftingGuidance.avoid` — words/phrases that would sound unlike them
- `draftingGuidance.strategyNotes` — short notes on how to apply this voice when drafting (not cover-letter-specific — general notes like "leads with the concrete ask before framing")
- `examples` — a few `{generic, inVoice, rationale}` triples showing a generic phrasing next to how this person would actually say it

## Step 8: Confirm and save

Show the person a short summary of the profile (traits + confidence levels + a couple of example rewrites). On confirmation, write the full profile — matching `core/schemas/voice-profile.schema.json` exactly, including `profileName`, `version: "0.2.0"`, and `sampleSummary.sources` counts — to `~/.voice-letter/profiles/<name>.json`. Never write this file inside the git repo.
```

- [ ] **Step 2: Verify all 8 traits and both source types are referenced**

```bash
for trait in tone sentenceRhythm paragraphStructure directness evidenceStyle transitions lexicon hedging; do
  grep -q "$trait" core/flows/capture-flow.md || { echo "MISSING: $trait"; exit 1; }
done
grep -q '"type": "sample"' core/flows/capture-flow.md && grep -q '"type": "elicited"' core/flows/capture-flow.md && \
echo "OK: capture flow covers all traits and both source types"
```
Expected: `OK: capture flow covers all traits and both source types`

- [ ] **Step 3: Commit**

```bash
git add core/flows/capture-flow.md
git commit -m "Add capture flow: adaptive samples + elicitation voice capture"
```

---

### Task 6: Draft flow

**Files:**
- Create: `core/flows/draft-flow.md`

**Interfaces:**
- Consumes: a `VOICE_PROFILE_JSON` matching Task 2's schema.
- Produces: the process `skills/voice-letter/SKILL.md`/`AGENTS.md` route to for "draft something in this voice." Output consumed by `revise-flow.md` (Task 7).

- [ ] **Step 1: Write the draft flow**

```markdown
# Flow: Draft In A Captured Voice

You are drafting a piece of writing using a supplied voice profile. The result should sound like the author on a clear, careful day — not mimicking surface quirks so aggressively that it reads unnatural, and not defaulting to generic template language either.

Use only the supplied evidence. Do not invent credentials, publications, employment history, awards, timelines, or personal motivations.

## Input

```text
VOICE_PROFILE_JSON:
[Load from ~/.voice-letter/profiles/<name>.json]

WRITING_GOAL:
[What this piece is and why — cover letter, email, LinkedIn post, essay, text message, etc. State the genre explicitly; it drives which AI-tells categories apply during revision.]

AUDIENCE:
[Who's reading this and their relationship to the author.]

TARGET_LENGTH:
[Word count, paragraph count, or an informal target like "fits a text message".]

CONTEXT_MATERIAL:
[Optional: CV, notes, background, prior thread — anything the draft should draw evidence from.]

CONSTRAINTS:
[Format, required points, deadline, tone adjustments.]
```

## Task

Draft a piece that:
- fits `WRITING_GOAL` and `TARGET_LENGTH`
- uses only evidence present in `CONTEXT_MATERIAL` or the profile's own `sources`
- follows `VOICE_PROFILE_JSON.traits` and `draftingGuidance`
- avoids generic filler regardless of genre

## Output

Return:
1. `draft` — the piece itself
2. `evidence_map` — each claim mapped to its source (omit if no `CONTEXT_MATERIAL` was supplied)
3. `uncertainties` — missing information or claims needing confirmation
4. `voice_fidelity_notes` — how the draft follows the profile (rhythm, lexicon, structure choices made and why)
```

- [ ] **Step 2: Verify the input contract matches the schema and the design's field list**

```bash
for field in VOICE_PROFILE_JSON WRITING_GOAL AUDIENCE TARGET_LENGTH CONTEXT_MATERIAL CONSTRAINTS; do
  grep -q "$field" core/flows/draft-flow.md || { echo "MISSING: $field"; exit 1; }
done
echo "OK: draft flow input contract complete"
```
Expected: `OK: draft flow input contract complete`

- [ ] **Step 3: Commit**

```bash
git add core/flows/draft-flow.md
git commit -m "Add general-purpose draft flow"
```

---

### Task 7: Revise flow (voice fidelity + AI-tells additive scoring)

**Files:**
- Create: `core/flows/revise-flow.md`

**Interfaces:**
- Consumes: `core/blocklist/ai-tells-baseline.md` and `core/blocklist/custom-terms.md` (Task 3), the active profile's `customBlocklist` (Task 2 schema), a `draft` from `draft-flow.md` (Task 6).
- Produces: the process `skills/voice-letter/SKILL.md`/`AGENTS.md` route to for "check this draft."

- [ ] **Step 1: Write the revise flow**

```markdown
# Flow: Revise For Voice Fidelity And AI-Tells

You are revising a draft against a voice profile and a layered blocklist. Make the piece more faithful, specific, and credible without making it weird. Two passes, run in order.

## Input

```text
VOICE_PROFILE_JSON:
[Load from ~/.voice-letter/profiles/<name>.json]

WRITING_SAMPLE_EXCERPTS:
[A few representative excerpts from the profile's own sources.]

DRAFT:
[Current draft text.]

WRITING_GOAL:
[Same value passed to draft-flow.md — determines which AI-tells categories apply.]
```

## Pass 1: Voice-fidelity

Check the draft's rhythm, paragraph structure, transitions, and lexicon against `VOICE_PROFILE_JSON.traits` and `WRITING_SAMPLE_EXCERPTS`. Flag anywhere the draft drifts from the profile without a good reason (e.g. defaulting to longer, more uniform sentences than the author ever writes).

## Pass 2: AI-tells (additive risk)

Load and merge three layers, broad to narrow:
1. `core/blocklist/ai-tells-baseline.md` — categories 1 (document/paragraph flow) through 6 (individual words). **Skip category 1 and the cover-letter-opener/career-summary-wrapper patterns in category 4 unless `WRITING_GOAL` is an application/persuasive genre** (cover letter, grant application, "why hire me" post). Categories 2, 3, 5, 6 always apply.
2. `core/blocklist/custom-terms.md` — your own git-tracked additions, same severity model, always apply.
3. `VOICE_PROFILE_JSON.customBlocklist` — this profile's own additions, always apply for this profile.

For each match, apply the evidence exceptions from `ai-tells-baseline.md` §"Recommended Lint Logic" before scoring:
- do not flag a phrase that appears naturally in the profile's own samples, unless it's still weakening the piece
- reduce risk when the sentence has concrete evidence (named project, metric, method, role requirement, artifact, product, team, deadline, constraint, result)
- increase risk when a paragraph has no applicant/subject-specific evidence at all

Score additively per `ai-tells-baseline.md` §7.1:
- +3: unevidenced hard-block phrase
- +2: soft-warning phrase in opener, closer, or topic sentence
- +2: body paragraph with no specific evidence
- +1: repeated transition, triad, or rhetorical template
- -2: phrase matches `VOICE_PROFILE_JSON.draftingGuidance.prefer`
- -2: sentence contains concrete evidence

Total the score and classify: 0-2 no issue, 3-5 style review, 6-8 revise before final, 9+ regenerate or run a focused evidence-grounding pass.

For each flag, either delete it, replace it with a concrete claim grounded in `evidence_map`, or keep it with a stated reason (appears in the profile's preferred language, or required by the target opportunity).

## Output

Return:
1. `revised_letter` — the revised draft
2. `change_log` — concise explanation per change
3. `remaining_risks` — factual uncertainty, tone mismatch, or missing evidence
4. `ai_tells_flagged` — list of `{category, pattern, layer, severity, score, rationale}`, plus the total score and its threshold band
```

- [ ] **Step 2: Verify the layering, genre-scoping, and scoring model are all present**

```bash
grep -q "core/blocklist/ai-tells-baseline.md" core/flows/revise-flow.md && \
grep -q "core/blocklist/custom-terms.md" core/flows/revise-flow.md && \
grep -q "customBlocklist" core/flows/revise-flow.md && \
grep -q "WRITING_GOAL" core/flows/revise-flow.md && \
grep -q "0-2 no issue" core/flows/revise-flow.md && \
echo "OK: revise flow wires all three blocklist layers and the scoring model"
```
Expected: `OK: revise flow wires all three blocklist layers and the scoring model`

- [ ] **Step 3: Commit**

```bash
git add core/flows/revise-flow.md
git commit -m "Add revise flow: voice fidelity + additive AI-tells scoring"
```

---

### Task 8: `skills/voice-letter/SKILL.md` (Claude Code)

**Files:**
- Create: `skills/voice-letter/SKILL.md`

**Interfaces:**
- Consumes: `core/flows/capture-flow.md`, `core/flows/draft-flow.md`, `core/flows/revise-flow.md`, `core/schemas/voice-profile.schema.json` (all previous tasks), via relative paths `../../core/...` (this file lives two levels below repo root).
- Produces: the entry point Claude Code loads via the `Skill` tool when `name: voice-letter` matches.

- [ ] **Step 1: Write SKILL.md**

```markdown
---
name: voice-letter
description: Use when the user wants to write something in their own personal voice (cover letters, emails, posts, essays, or any other writing task), wants to capture or update a personal voice profile from writing samples and/or short elicitation answers, or wants an existing draft checked for generic, AI-sounding phrasing before sending it.
---

# Voice Letter

Draft anything in a captured personal voice, and catch generic AI-sounding phrasing before it goes out. Never fabricates credentials, history, or claims not present in supplied evidence; never infers sensitive personal attributes.

## Profiles

Voice profiles are stored at `~/.voice-letter/profiles/<name>.json`, outside this repo and outside any single agent's own config directory — the same profile works whether you're in Claude Code, Codex, or another agent. Schema: `../../core/schemas/voice-profile.schema.json` (v0.2.0).

If no profile name is given and more than one exists, ask which to use. If none exist, offer to start capture.

## Modes

### Capture or update a profile

Read `../../core/flows/capture-flow.md` and follow it exactly. It references `../../core/elicitation-bank.md` for the interactive scenario bank.

### Draft something

Read `../../core/flows/draft-flow.md` and follow it, using the profile loaded above.

### Check a draft for voice fidelity and AI-tells

Read `../../core/flows/revise-flow.md` and follow it. It references `../../core/blocklist/ai-tells-baseline.md`, `../../core/blocklist/custom-terms.md`, and the active profile's own `customBlocklist`.

## Non-goals

- Do not impersonate a person deceptively.
- Do not fabricate experience, credentials, publications, grants, or personal history.
- Do not infer sensitive personal attributes from samples or elicited text.
- Do not overfit to quirks that make output awkward, unprofessional, or caricatured.
```

- [ ] **Step 2: Verify frontmatter and routing**

```bash
head -4 skills/voice-letter/SKILL.md | grep -q "^name: voice-letter$" && \
grep -q "\.\./\.\./core/flows/capture-flow.md" skills/voice-letter/SKILL.md && \
grep -q "\.\./\.\./core/flows/draft-flow.md" skills/voice-letter/SKILL.md && \
grep -q "\.\./\.\./core/flows/revise-flow.md" skills/voice-letter/SKILL.md && \
echo "OK: SKILL.md frontmatter and routing present"
```
Expected: `OK: SKILL.md frontmatter and routing present`

- [ ] **Step 3: Verify every relative path in SKILL.md actually resolves from its own directory**

```bash
cd skills/voice-letter
for p in ../../core/schemas/voice-profile.schema.json ../../core/flows/capture-flow.md ../../core/flows/draft-flow.md ../../core/flows/revise-flow.md ../../core/elicitation-bank.md ../../core/blocklist/ai-tells-baseline.md ../../core/blocklist/custom-terms.md; do
  test -f "$p" || { echo "BROKEN PATH: $p"; exit 1; }
done
cd - > /dev/null
echo "OK: all relative paths resolve"
```
Expected: `OK: all relative paths resolve`

- [ ] **Step 4: Commit**

```bash
git add skills/voice-letter/SKILL.md
git commit -m "Add skills/voice-letter/SKILL.md for Claude Code"
```

---

### Task 9: `AGENTS.md` (generic harnesses)

**Files:**
- Create: `AGENTS.md`

**Interfaces:**
- Mirrors Task 8's routing/operating content for Cursor, Windsurf, Pi, opencode, Gemini CLI — same trigger conditions, root-relative paths (`core/...` instead of `../../core/...`).

- [ ] **Step 1: Write AGENTS.md**

```markdown
# Voice Letter — Agent Instructions

Agent-facing instructions for writing in a captured personal voice and catching generic, AI-sounding phrasing before it ships. Never fabricates credentials, history, or claims not present in supplied evidence; never infers sensitive personal attributes.

## When to apply these instructions

Apply whenever the user asks you to:
- capture or update a personal voice profile, from writing samples, short elicitation answers, or both
- draft anything (cover letter, email, post, essay, any writing task) in a captured voice
- check an existing draft for generic/AI-sounding phrasing before sending it

## Profiles

Voice profiles are stored at `~/.voice-letter/profiles/<name>.json`, outside this repo and outside any single agent's own config directory — the same profile works across Claude Code, Codex, or any other agent. Schema: `core/schemas/voice-profile.schema.json` (v0.2.0).

If no profile name is given and more than one exists, ask which to use. If none exist, offer to start capture.

## Modes

### Capture or update a profile

Read `core/flows/capture-flow.md` and follow it exactly. It references `core/elicitation-bank.md` for the interactive scenario bank.

### Draft something

Read `core/flows/draft-flow.md` and follow it, using the profile loaded above.

### Check a draft for voice fidelity and AI-tells

Read `core/flows/revise-flow.md` and follow it. It references `core/blocklist/ai-tells-baseline.md`, `core/blocklist/custom-terms.md`, and the active profile's own `customBlocklist`.

## Non-goals

- Do not impersonate a person deceptively.
- Do not fabricate experience, credentials, publications, grants, or personal history.
- Do not infer sensitive personal attributes from samples or elicited text.
- Do not overfit to quirks that make output awkward, unprofessional, or caricatured.
```

- [ ] **Step 2: Verify AGENTS.md routing and that its root-relative paths resolve**

```bash
for p in core/schemas/voice-profile.schema.json core/flows/capture-flow.md core/flows/draft-flow.md core/flows/revise-flow.md core/elicitation-bank.md core/blocklist/ai-tells-baseline.md core/blocklist/custom-terms.md; do
  test -f "$p" || { echo "BROKEN PATH: $p"; exit 1; }
done
echo "OK: all AGENTS.md paths resolve"
```
Expected: `OK: all AGENTS.md paths resolve`

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "Add AGENTS.md for generic-harness agents"
```

---

### Task 10: Plugin/marketplace manifests + CHANGELOG.md

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `.codex-plugin/plugin.json`
- Create: `.agents/plugins/marketplace.json`
- Create: `CHANGELOG.md`

**Interfaces:**
- Consumes: `skills/voice-letter/` (Task 8) as the `skills` path both `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` point at.
- Produces: what `claude plugin marketplace add` / `claude plugin install` and the Codex marketplace convention read.

- [ ] **Step 1: Write `.claude-plugin/plugin.json`**

```json
{
  "name": "voice-letter",
  "description": "Write in your own captured voice: draft anything (cover letters, emails, posts, essays) from a personal voice profile, and flag generic AI-sounding phrasing before you send it.",
  "version": "0.2.0",
  "author": { "name": "commrelayunit" },
  "homepage": "https://github.com/commrelayunit/voice-letter",
  "skills": ["./skills/voice-letter"]
}
```

- [ ] **Step 2: Write `.claude-plugin/marketplace.json`**

```json
{
  "name": "voice-letter",
  "owner": { "name": "commrelayunit" },
  "metadata": {
    "description": "Write in your own captured voice: draft anything from a personal voice profile and flag generic AI-sounding phrasing.",
    "version": "0.2.0"
  },
  "plugins": [
    {
      "name": "voice-letter",
      "description": "Write in your own captured voice: draft anything (cover letters, emails, posts, essays) from a personal voice profile, and flag generic AI-sounding phrasing before you send it.",
      "source": "./",
      "version": "0.2.0"
    }
  ]
}
```

- [ ] **Step 3: Write `.codex-plugin/plugin.json`**

```json
{
  "name": "voice-letter",
  "version": "0.2.0",
  "description": "Write in your own captured voice: draft anything from a personal voice profile and flag generic AI-sounding phrasing.",
  "skills": "./skills/",
  "author": { "name": "commrelayunit" }
}
```

- [ ] **Step 4: Write `.agents/plugins/marketplace.json`**

```json
{
  "name": "voice-letter",
  "interface": { "displayName": "Voice Letter" },
  "plugins": [
    {
      "name": "voice-letter",
      "source": { "source": "github", "repo": "commrelayunit/voice-letter" },
      "policy": { "installation": "AVAILABLE", "authentication": "NONE" },
      "category": "Writing"
    }
  ]
}
```

- [ ] **Step 5: Validate all four manifests are well-formed JSON**

```bash
for f in .claude-plugin/plugin.json .claude-plugin/marketplace.json .codex-plugin/plugin.json .agents/plugins/marketplace.json; do
  jq empty "$f" || { echo "INVALID JSON: $f"; exit 1; }
done
echo "OK: all manifests are valid JSON"
```
Expected: `OK: all manifests are valid JSON`

- [ ] **Step 6: Cross-check the two plugin manifests point at the real skills directory**

```bash
test "$(jq -r '.skills[0]' .claude-plugin/plugin.json)" = "./skills/voice-letter" && \
test -d "$(jq -r '.skills[0]' .claude-plugin/plugin.json)" && \
echo "OK: plugin.json points at a real directory"
```
Expected: `OK: plugin.json points at a real directory`

- [ ] **Step 7: Write CHANGELOG.md**

```markdown
# Changelog

All notable changes to `voice-letter` are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this
project uses [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-07-17

### Changed
- Generalized from a cover-letter-only prompt pack to a general-purpose
  "write in my voice" skill: any writing task, not just cover letters.
- Voice capture is now adaptive: analyzes pasted samples first, then fills
  remaining low-confidence traits with targeted interactive elicitation
  (the person writes short responses to realistic scenarios, never
  self-reports their style).
- Packaged as an installable plugin for Claude Code and Codex
  (`.claude-plugin/`, `.codex-plugin/`, `.agents/plugins/`), with a generic
  `AGENTS.md` for Cursor/Windsurf/Pi and documented skill-copy install for
  Gemini CLI/opencode.
- Revision now runs a two-pass check: voice fidelity, then an additive-risk
  AI-tells scan across three blocklist layers (repo baseline, repo-tracked
  custom terms, per-profile custom terms), genre-scoped so application-only
  patterns don't misfire on casual writing.
- Voice profile schema bumped to 0.2.0: added `profileName`, `customBlocklist`,
  `sources` (raw provenance for gap-aware profile updates), renamed
  `draftingGuidance.coverLetterStrategy` to `draftingGuidance.strategyNotes`.
- Profile storage moved from repo-adjacent scratch files to
  `~/.voice-letter/profiles/<name>.json`, agent-neutral and never committed.

### Removed
- `prompts/01-extract-voice-profile.md`, `prompts/02-draft-cover-letter.md`,
  `prompts/03-revise-for-fidelity.md`, and the v0.1.0 schema — superseded by
  `core/flows/*.md` and `core/schemas/voice-profile.schema.json`.
```

- [ ] **Step 8: Verify CHANGELOG structure**

```bash
grep -q "^## \[0.2.0\]" CHANGELOG.md && echo "OK: changelog entry present"
```
Expected: `OK: changelog entry present`

- [ ] **Step 9: Commit**

```bash
git add .claude-plugin/ .codex-plugin/ .agents/ CHANGELOG.md
git commit -m "Add Claude Code and Codex plugin/marketplace manifests, CHANGELOG"
```

---

### Task 11: README.md and product-brief.md rewrite

**Files:**
- Modify: `README.md` (full rewrite)
- Modify: `docs/product-brief.md` (full rewrite)

**Interfaces:**
- Consumes: every path created in Tasks 2–10 — this task's verification step is a full cross-reference check of the whole repo.

- [ ] **Step 1: Rewrite README.md**

```markdown
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
```

- [ ] **Step 2: Rewrite docs/product-brief.md**

```markdown
# Product Brief

## Goal

A skill that learns a person's writing voice — from samples, interactive elicitation, or both — and drafts anything in that voice: cover letters, emails, posts, essays, or any other writing task, while actively catching generic AI-sounding phrasing.

## Core Use Case

A person provides, in any combination:

- writing samples that represent how they naturally write
- short written responses to realistic elicitation scenarios (never self-reported style claims)
- a goal, audience, and target length for what they want drafted
- optional context material: CV, notes, background, prior thread
- constraints such as maximum length, format, and required points

The system produces:

- a structured, named voice profile grounded in the collected sources
- a first draft in that voice, fit to the stated goal and length
- a revision pass with two checks: voice fidelity against the profile, and an additive-risk scan against a layered, extensible blocklist of AI "tells"

## Non-Goals

- Do not impersonate a person deceptively.
- Do not fabricate experience, credentials, publications, grants, or personal history.
- Do not infer sensitive personal attributes from samples or elicited text.
- Do not overfit to quirks that make the final piece awkward or unprofessional.
- Do not store profiles or raw sources inside the git repo, or inside any single agent's own config directory.

## Product Shape

A multi-agent skill: `core/` holds the agent-agnostic schema, flows, elicitation bank, and blocklists; `skills/voice-letter/SKILL.md` and `AGENTS.md` are thin, tool-specific entry points into the same content. Packaged as an installable plugin for Claude Code and Codex; installable by file-copy for Gemini CLI, opencode, and generic harnesses.

## Voice Profile Dimensions

The profile captures 8 trait dimensions: tone, sentence rhythm, paragraph structure, directness, evidence style, transitions, lexicon, and hedging — each with a description, cited evidence, and a confidence level. It also carries drafting guidance (preferred/avoided language, strategy notes), in-voice rewrite examples, and a per-profile custom blocklist layered on top of the repo-wide baseline.

## Quality Bar

A good output should feel like:

- the person wrote it on a focused day
- the piece is specific to its goal and audience
- claims are grounded in supplied evidence
- the prose avoids generic filler for its genre
- the voice is recognizable but not caricatured
```

- [ ] **Step 3: Full-repo cross-reference check**

```bash
# Every path referenced by SKILL.md/AGENTS.md/README.md must exist.
for p in core/schemas/voice-profile.schema.json core/flows/capture-flow.md core/flows/draft-flow.md core/flows/revise-flow.md core/elicitation-bank.md core/blocklist/ai-tells-baseline.md core/blocklist/custom-terms.md skills/voice-letter/SKILL.md AGENTS.md .claude-plugin/plugin.json .claude-plugin/marketplace.json .codex-plugin/plugin.json .agents/plugins/marketplace.json CHANGELOG.md docs/product-brief.md examples/writing-samples.md; do
  test -e "$p" || { echo "MISSING: $p"; exit 1; }
done
echo "OK: full repo layout matches README"
```
Expected: `OK: full repo layout matches README`

- [ ] **Step 4: Commit**

```bash
git add README.md docs/product-brief.md
git commit -m "Rewrite README and product brief for general-purpose, multi-agent scope"
```

---

### Task 12: Final verification pass

**Files:** none created — this task only verifies Tasks 1–11.

- [ ] **Step 1: Confirm no old paths remain**

```bash
test ! -e prompts && test ! -e schemas && test ! -e generated-text-giveaways.md && echo "OK: no stale top-level files"
```
Expected: `OK: no stale top-level files`

- [ ] **Step 2: Re-validate every JSON file in the repo parses**

```bash
find . -name "*.json" -not -path "./.git/*" -print0 | xargs -0 -I{} sh -c 'jq empty "{}" || echo "INVALID: {}"'
echo "done"
```
Expected: no `INVALID:` lines printed, then `done`.

- [ ] **Step 3: Re-run the schema fixture checks from Task 2**

```bash
jq -e '(.profileName != null) and (.version == "0.2.0")' core/schemas/fixtures/valid-profile.json
jq -e '(.profileName != null)' core/schemas/fixtures/invalid-profile.json; echo "exit: $?"
```
Expected: first command prints `true` (exit `0`); second prints `false` and reports `exit: 1`.

- [ ] **Step 4: Confirm git status is clean**

```bash
git status --short
```
Expected: no output (everything committed).

- [ ] **Step 5: Final commit if Step 4 showed anything outstanding**

```bash
git add -A
git commit -m "Final cleanup pass for voice-letter multi-agent skill"
```
(Skip this step entirely if Step 4 already showed a clean tree.)
