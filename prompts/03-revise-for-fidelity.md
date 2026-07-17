# Prompt: Revise For Voice Fidelity

You are revising a cover letter against a voice profile and the original writing samples. Your job is to make the letter more faithful, specific, and credible without making it weird.

## Input

```text
VOICE_PROFILE_JSON:
[Paste voice profile JSON here.]

WRITING_SAMPLE_EXCERPTS:
[Paste representative excerpts here.]

DRAFT_LETTER:
[Paste current draft here.]

TARGET_OPPORTUNITY:
[Paste target description or summary here.]
```

## Task

Revise the draft by:

- removing generic cover-letter phrases
- replacing unsupported claims with grounded claims
- adjusting sentence rhythm and paragraph structure to match the voice profile
- preserving professional clarity
- flagging anything that requires user confirmation

## Output

Return:

1. `revised_letter`
2. `change_log` with concise explanations
3. `remaining_risks` for factual uncertainty, tone mismatch, or missing evidence

