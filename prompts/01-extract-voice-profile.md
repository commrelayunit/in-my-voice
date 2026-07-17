# Prompt: Extract Voice Profile

You are analyzing writing samples to build a reusable voice profile for future drafting. Your job is to describe how the author writes, not what the author believes.

Do not infer sensitive personal attributes. Do not diagnose personality. Do not invent biography. Ground every observation in the supplied samples.

## Input

```text
WRITING_SAMPLES:
[Paste labeled samples here. Include genre/context when known.]
```

## Task

Create a structured voice profile in JSON that follows `schemas/voice-profile.schema.json`.

Focus on:

- rhythm, sentence length, and paragraph shape
- tone and level of formality
- directness, hedging, and certainty
- how the author introduces claims
- how the author uses evidence, examples, and contrast
- preferred transitions and connective tissue
- recurring lexical choices
- phrases or moves that would make generated prose sound unlike the author

## Output Rules

- Return valid JSON only.
- Include short evidence snippets from the samples.
- Separate "observed" traits from "inferred drafting guidance".
- Keep the profile useful for cover-letter drafting, not literary criticism.
- If evidence is thin, mark confidence as low instead of pretending.

