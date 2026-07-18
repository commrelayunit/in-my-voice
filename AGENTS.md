# In My Voice — Agent Instructions

Agent-facing instructions for writing in a captured personal voice and catching generic, AI-sounding phrasing before it ships. Never fabricates credentials, history, or claims not present in supplied evidence; never infers sensitive personal attributes.

## When to apply these instructions

Apply whenever the user asks you to:
- capture or update a personal voice profile, from writing samples, short elicitation answers, or both
- organize writing samples, plan a profile taxonomy, structure writing samples, or audit a sample hierarchy
- build a voice profile from scratch with guided setup or onboarding
- draft anything (cover letter, email, post, essay, any writing task) in a captured voice
- check an existing draft for generic/AI-sounding phrasing before sending it

## Profiles

Voice profiles are stored at `~/.in-my-voice/profiles/<name>.json`, outside this repo and outside any single agent's own config directory — the same profile works across Claude Code, Codex, or any other agent. Schema: `core/schemas/voice-profile.schema.json` (v0.2.0).

If no profile name is given and more than one exists, ask which to use. If none exist, offer to start capture.

## Modes

### Capture or update a profile

Read `core/flows/capture-flow.md` and follow it exactly. It references `core/elicitation-bank.md` for the interactive scenario bank.

### Organize writing samples

Read `core/flows/organize-samples-flow.md` and follow it. It can work from a rough sample inventory without requiring raw private samples, and it produces a concrete hierarchy/capture plan for `core/flows/capture-flow.md`.

### Guided profile setup

Read `core/flows/guided-profile-setup-flow.md` and follow it. It coordinates sample organization, capture, validation, a short test draft, and a next-step plan.

### Draft something

Read `core/flows/draft-flow.md` and follow it, using the profile loaded above.

### Check a draft for voice fidelity and AI-tells

Read `core/flows/revise-flow.md` and follow it. It references `core/blocklist/ai-tells-baseline.md`, `core/blocklist/custom-terms.md`, and the active profile's own `customBlocklist`.

## Non-goals

- Do not impersonate a person deceptively.
- Do not fabricate experience, credentials, publications, grants, or personal history.
- Do not infer sensitive personal attributes from samples or elicited text.
- Do not overfit to quirks that make output awkward, unprofessional, or caricatured.
