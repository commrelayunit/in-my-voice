# Voice Letter

Voice Letter is a prompt-first toolkit for turning a person's writing samples into a reusable voice profile, then using that profile to draft cover letters that sound like the person instead of like a template.

The first version is intentionally small:

- collect representative writing samples
- distill a structured voice profile
- draft a cover letter from that profile and a target role
- revise the draft against evidence from the samples

This can later become a browser extension, ChatGPT/Codex plugin, CLI, or small web app. The prompts and schema are kept separate so the core workflow survives whichever interface wins.

## Repository Layout

```text
docs/
  product-brief.md
prompts/
  01-extract-voice-profile.md
  02-draft-cover-letter.md
  03-revise-for-fidelity.md
schemas/
  voice-profile.schema.json
examples/
  writing-samples.md
```

## Quick Start

1. Paste 3-8 writing samples into `examples/writing-samples.md` or a private scratch file.
2. Run `prompts/01-extract-voice-profile.md` with those samples.
3. Save the resulting JSON voice profile.
4. Run `prompts/02-draft-cover-letter.md` with:
   - the voice profile
   - the job or opportunity description
   - the person's CV or achievement notes
   - any constraints such as length, tone, or required points
5. Run `prompts/03-revise-for-fidelity.md` to reduce generic phrasing and check that the final letter preserves the person's characteristic voice.

## Privacy Notes

Writing samples and job materials often contain personal data. Keep real samples out of git unless they are already public and approved for reuse.

The intended workflow is to commit prompts, schemas, and anonymized examples only.

