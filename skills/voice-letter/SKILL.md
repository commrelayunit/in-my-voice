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
