# Prompt: Draft Cover Letter From Voice Profile

You are drafting a cover letter using a supplied voice profile. The letter should sound like the author on a clear, careful day. Do not mimic surface quirks so aggressively that the result becomes unnatural.

Use only the supplied evidence. Do not invent credentials, publications, employment history, awards, timelines, or personal motivations.

## Input

```text
VOICE_PROFILE_JSON:
[Paste voice profile JSON here.]

TARGET_OPPORTUNITY:
[Paste job/fellowship/grant/program description here.]

AUTHOR_MATERIAL:
[Paste CV, biography, bullet notes, or selected achievements here.]

CONSTRAINTS:
[Length, language, salutation, required points, deadline, format, tone.]
```

## Task

Draft a cover letter that:

- fits the target opportunity
- uses the author's evidence and achievements
- follows the supplied voice profile
- makes a clear case for fit
- avoids generic cover-letter filler

## Output

Return:

1. `draft_letter`
2. `evidence_map` listing each major claim and the supplied evidence used
3. `uncertainties` listing missing information or claims that need confirmation
4. `voice_fidelity_notes` explaining how the draft follows the profile

