# Changelog

All notable changes to `voice-letter` are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this
project uses [Semantic Versioning](https://semver.org/).

## [0.2.1] - 2026-07-17

### Changed
- README's Gemini CLI, opencode, and generic-harness (Cursor/Windsurf/Pi) install
  instructions now require a full repo clone instead of copying a single file —
  `skills/voice-letter/SKILL.md` and `AGENTS.md` both depend on `core/` via
  relative paths, so a single-file copy silently broke at runtime.
- Removed the stale `docs/product-brief.md` reference from README's repository
  layout (that file is no longer part of the shipped repo).

## [0.2.0] - 2026-07-17

### Changed
- Generalized from a cover-letter-only prompt pack to a general-purpose
  "write in my voice" skill: any writing task, not just cover letters.
- Voice capture is now adaptive: analyzes pasted samples first, then fills
  remaining low-confidence traits with targeted interactive elicitation
  (the person writes short responses to realistic scenarios, never
  self-reports their style).
- Packaged as an installable plugin for Claude Code and Codex
  (`.claude-plugin/`, `.codex-plugin/`, `.agents/plugins/`), with a generic
  `AGENTS.md` for Cursor/Windsurf/Pi and documented skill-copy install for
  Gemini CLI/opencode.
- Revision now runs a two-pass check: voice fidelity, then an additive-risk
  AI-tells scan across three blocklist layers (repo baseline, repo-tracked
  custom terms, per-profile custom terms), genre-scoped so application-only
  patterns don't misfire on casual writing.
- Voice profile schema bumped to 0.2.0: added `profileName`, `customBlocklist`,
  `sources` (raw provenance for gap-aware profile updates), renamed
  `draftingGuidance.coverLetterStrategy` to `draftingGuidance.strategyNotes`.
- Profile storage moved from repo-adjacent scratch files to
  `~/.voice-letter/profiles/<name>.json`, agent-neutral and never committed.

### Removed
- `prompts/01-extract-voice-profile.md`, `prompts/02-draft-cover-letter.md`,
  `prompts/03-revise-for-fidelity.md`, and the v0.1.0 schema — superseded by
  `core/flows/*.md` and `core/schemas/voice-profile.schema.json`.
