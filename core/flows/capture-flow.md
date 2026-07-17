# Flow: Capture Or Update A Voice Profile

You are building or updating a structured voice profile so future drafts sound like the author, not like a template. Describe how the author writes, not what they believe. Do not infer sensitive personal attributes, diagnose personality, or invent biography. Ground every trait in supplied evidence.

## Step 1: Identify the profile

Ask which named profile to build or update (e.g. "work", "personal"). If it already exists at `~/.in-my-voice/profiles/<name>.json`, load it — you'll extend its `sources` and `traits`, not start over.

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

A few direct questions are fine where self-report is reliable (see the exceptions listed in `core/elicitation-bank.md`) — but never for `tone`, `directness`, `hedging`, or `evidenceStyle`.

## Step 6: Re-run trait inference

Re-analyze all traits, now including the elicited responses alongside the samples. Confidence should generally rise for traits that were gaps.

## Step 7: Build drafting guidance and examples

From everything collected, fill in:
- `draftingGuidance.prefer` — words/phrases/moves this person actually uses
- `draftingGuidance.avoid` — words/phrases that would sound unlike them
- `draftingGuidance.strategyNotes` — short notes on how to apply this voice when drafting (not cover-letter-specific — general notes like "leads with the concrete ask before framing")
- `examples` — a few `{generic, inVoice, rationale}` triples showing a generic phrasing next to how this person would actually say it
- `customBlocklist` — start as an empty array (`[]`) unless the person specifically flags terms to avoid for this profile
- `limits` — start as an empty array (`[]`) unless the person states a hard constraint (e.g. never mention a specific former employer)

## Step 8: Confirm and save

Show the person a short summary of the profile (traits + confidence levels + a couple of example rewrites). On confirmation, write the full profile — matching `core/schemas/voice-profile.schema.json` exactly, including `profileName`, `version: "0.2.0"`, and `sampleSummary.sources` counts — to `~/.in-my-voice/profiles/<name>.json`. Never write this file inside the git repo.
