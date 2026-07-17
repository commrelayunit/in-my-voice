# Product Brief

## Goal

A skill that learns a person's writing voice — from samples, interactive elicitation, or both — and drafts anything in that voice: cover letters, emails, posts, essays, or any other writing task, while actively catching generic AI-sounding phrasing.

## Core Use Case

A person provides, in any combination:

- writing samples that represent how they naturally write
- short written responses to realistic elicitation scenarios (never self-reported style claims)
- a goal, audience, and target length for what they want drafted
- optional context material: CV, notes, background, prior thread
- constraints such as maximum length, format, and required points

The system produces:

- a structured, named voice profile grounded in the collected sources
- a first draft in that voice, fit to the stated goal and length
- a revision pass with two checks: voice fidelity against the profile, and an additive-risk scan against a layered, extensible blocklist of AI "tells"

## Non-Goals

- Do not impersonate a person deceptively.
- Do not fabricate experience, credentials, publications, grants, or personal history.
- Do not infer sensitive personal attributes from samples or elicited text.
- Do not overfit to quirks that make the final piece awkward or unprofessional.
- Do not store profiles or raw sources inside the git repo, or inside any single agent's own config directory.

## Product Shape

A multi-agent skill: `core/` holds the agent-agnostic schema, flows, elicitation bank, and blocklists; `skills/voice-letter/SKILL.md` and `AGENTS.md` are thin, tool-specific entry points into the same content. Packaged as an installable plugin for Claude Code and Codex; installable by file-copy for Gemini CLI, opencode, and generic harnesses.

## Voice Profile Dimensions

The profile captures 8 trait dimensions: tone, sentence rhythm, paragraph structure, directness, evidence style, transitions, lexicon, and hedging — each with a description, cited evidence, and a confidence level. It also carries drafting guidance (preferred/avoided language, strategy notes), in-voice rewrite examples, and a per-profile custom blocklist layered on top of the repo-wide baseline.

## Quality Bar

A good output should feel like:

- the person wrote it on a focused day
- the piece is specific to its goal and audience
- claims are grounded in supplied evidence
- the prose avoids generic filler for its genre
- the voice is recognizable but not caricatured
