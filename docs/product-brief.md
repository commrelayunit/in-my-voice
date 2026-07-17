# Product Brief

## Goal

Build a practical assistant that learns a person's writing voice from samples and drafts cover letters that preserve that voice while still satisfying the conventions of a cover letter.

## Core Use Case

A person provides:

- writing samples that represent how they naturally write
- a CV, biography, or achievement notes
- a target role, fellowship, grant, or opportunity description
- constraints such as maximum length, language, formality, and required claims

The system produces:

- a structured voice profile grounded in the samples
- a first cover-letter draft
- a revision pass that removes generic language, unsupported claims, and mismatched tone

## Non-Goals For The First Version

- Do not impersonate a person deceptively.
- Do not fabricate experience, credentials, publications, grants, or personal history.
- Do not infer sensitive personal attributes from samples.
- Do not store real samples in the repository.
- Do not overfit to quirks that make the final letter awkward or unprofessional.

## Product Shape

Start as a prompt pack. This is the fastest useful unit and avoids choosing an interface too early.

Likely next forms:

- CLI that accepts sample files, a CV, and a job description
- ChatGPT/Codex plugin with a local/private file workflow
- browser extension for drafting in job application forms
- small local-first web app with encrypted project files

## Voice Profile Dimensions

The profile should capture:

- sentence rhythm and length
- paragraph structure
- preferred transitions
- level of directness
- degree of warmth or restraint
- technical density
- evidence style
- hedging and certainty patterns
- recurring rhetorical moves
- words or phrases to prefer
- words or phrases to avoid
- examples of in-voice rewrites

## Quality Bar

A good output should feel like:

- the person wrote it on a focused day
- the letter is specific to the opportunity
- the claims are grounded in supplied evidence
- the prose avoids cover-letter cliches
- the voice is recognizable but not caricatured

