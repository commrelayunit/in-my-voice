# Flow: Draft In A Captured Voice

You are drafting a piece of writing using a supplied voice profile. The result should sound like the author on a clear, careful day — not mimicking surface quirks so aggressively that it reads unnatural, and not defaulting to generic template language either.

Use only the supplied evidence. Do not invent credentials, publications, employment history, awards, timelines, or personal motivations.

## Input

```text
VOICE_PROFILE_JSON:
[Load from ~/.in-my-voice/profiles/<name>.json]

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

## Context selection

Before drafting, resolve the writing request to a target hierarchy path or nearest available path:

1. Infer a desired `targetSamplePath` from `WRITING_GOAL`, `AUDIENCE`, channel, and constraints. Examples: paper abstract -> `academic/paper/abstract`; first-contact professional email -> `email/formal/cold-outreach`; casual coordination reply -> `social/messenger/coordination`.
2. If `VOICE_PROFILE_JSON.contextSlices[targetSamplePath]` exists, use that slice first.
3. If no exact slice exists, use the nearest parent or sibling context with the same top-level domain, for example `email/formal` before global email evidence, or `academic/paper/introduction` before unrelated social posts.
4. If the profile has only the legacy flat shape, use global `traits`, `draftingGuidance`, and representative `sources` as before.
5. Do not use raw sources from mismatched contexts to imitate rhythm or lexicon unless the selected slice is low confidence and the mismatch is disclosed in `voice_fidelity_notes`.

Build a working profile slice from:
- matching `contextSlices` traits/guidance/examples
- matching `sources[]` where `samplePath` equals the target path or selected nearby path
- global traits/guidance only as fallback or cross-context constraints
- global `limits` and `customBlocklist`, which always apply

## Task

Draft a piece that:
- fits `WRITING_GOAL` and `TARGET_LENGTH`
- uses only evidence present in `CONTEXT_MATERIAL` or the profile's own `sources`
- follows the selected context slice first, then `VOICE_PROFILE_JSON.traits` and `draftingGuidance` as fallback
- avoids generic filler regardless of genre

## Output

Return:
1. `draft` — the piece itself
2. `evidence_map` — each claim mapped to its source (omit if no `CONTEXT_MATERIAL` was supplied)
3. `uncertainties` — missing information or claims needing confirmation
4. `voice_fidelity_notes` — selected `targetSamplePath`, exact/nearest/global match status, confidence caveats, and how the draft follows the chosen rhythm, lexicon, and structure
