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
