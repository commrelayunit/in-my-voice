# Flow: Capture Or Update A Voice Profile

You are building or updating a structured voice profile so future drafts sound like the author, not like a template. Describe how the author writes, not what they believe. Do not infer sensitive personal attributes, diagnose personality, or invent biography. Ground every trait in supplied evidence.

## Step 1: Identify the profile

Ask which named profile to build or update (e.g. "work", "personal"). If it already exists at `~/.in-my-voice/profiles/<name>.json`, load it — you'll extend its `sources` and `traits`, not start over.

## Step 2: Collect samples (if any)

Ask whether the person has existing writing to paste (emails, docs, posts, notes). This is optional — if they have none, skip straight to Step 4 with every trait treated as a gap.

For each sample, capture: title/context, audience, rough date, and the text itself. Also capture or infer a hierarchy path for the sample:

- Ask for the path when the user already knows the category, using slash-separated labels such as `academic/paper/abstract`, `email/formal/follow-up`, or `social/messenger/coordination`.
- If the user is unsure, infer the smallest useful path from the sample's genre, audience, channel, and purpose, then confirm it before saving.
- Keep meaningfully different contexts separate. Do not merge academic prose, formal email, public social posts, and messenger replies just because they came from the same author.
- If the user has a prior capture plan from `core/flows/organize-samples-flow.md`, prefer those planned paths and mark any new path as a proposed addition.

Append each as a `sources` entry with `"type": "sample"` and, when known, `samplePath`, `audience`, and `notes`.

## Step 3: Analyze samples against the trait schema

Analyze all collected samples against the 8 trait dimensions in `core/schemas/voice-profile.schema.json`: `tone`, `sentenceRhythm`, `paragraphStructure`, `directness`, `evidenceStyle`, `transitions`, `lexicon`, `hedging`. For each, write a `description`, cite short `evidence` snippets from the samples, and assign `confidence`: `low`, `medium`, or `high`. If evidence is thin, mark confidence low rather than guessing.

Then analyze each sufficiently represented `samplePath` separately. Store context-specific observations under `contextSlices[<samplePath>]` when the path has enough evidence to differ from the global profile or when it is a target context for future drafting. A slice may contain partial observations, but each observation must still be evidence-backed. Use global `traits` and `draftingGuidance` only for cross-context patterns that are stable across the collected material.

## Step 4: Identify gaps

Any global trait at `low` confidence (or with no evidence at all) is a gap. Also identify low-confidence context branches: paths with too few samples, missing elicited responses, or traits that appear context-specific but are not yet supported.

With zero samples, every trait is a gap. If there is no hierarchy yet, start with a small set of target paths based on the user's goal rather than building a broad taxonomy all at once.

## Step 5: Fill gaps interactively

For each gap, pick a matching scenario from `core/elicitation-bank.md` and ask the person to write a short (2-5 sentence) response, one scenario at a time. Do not ask them to describe their style — ask them to actually write something realistic, and infer the trait from what they wrote.

Append each response as a `sources` entry with `"type": "elicited"`, the matching `scenarioId`, and the relevant `samplePath` when the prompt is intended to fill a specific context branch. If an elicitation answer is general, leave `samplePath` absent and use it only for global traits.

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

Also fill in hierarchy-aware fields when sample paths are known:
- `sampleSummary.hierarchy` — one object per path with `path`, `sampleCount`, optional `elicitedCount`, `purpose`, `confidence`, and notes about gaps.
- `sampleSummary.hierarchyNotes` — short migration or interpretation notes, such as "Older uncategorized samples remain in global traits only."
- `contextSlices` — only for contexts with useful evidence. Each slice should include the local trait/guidance differences needed for drafting in that context, not a duplicate of the whole global profile.

## Step 8: Confirm and save

Show the person a short summary of the profile (traits + confidence levels + a couple of example rewrites). On confirmation, write the full profile — matching `core/schemas/voice-profile.schema.json` exactly, including `profileName`, `version: "0.2.0"`, and `sampleSummary.sources` counts — to `~/.in-my-voice/profiles/<name>.json`. Never write this file inside the git repo.

Backward compatibility: existing `0.2.0` profiles without `samplePath`, `sampleSummary.hierarchy`, or `contextSlices` are valid. When updating one, do not invent old sample paths silently. Either ask the user to classify existing sources, infer paths with confirmation, or leave uncategorized sources as global evidence and document that choice in `sampleSummary.hierarchyNotes`.
