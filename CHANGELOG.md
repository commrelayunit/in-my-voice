# Changelog

All notable changes to `in-my-voice` are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this
project uses [Semantic Versioning](https://semver.org/).

## [0.2.4] - 2026-07-17

### Changed
- Added a Codex CLI fallback install path using the active
  `${CODEX_HOME:-$HOME/.codex}/skills` directory for headless setups where
  marketplace plugins are not injected into the prompt.

## [0.2.3] - 2026-07-17

### Changed
- Added Codex plugin interface metadata so the plugin validates cleanly for
  Codex discovery and presentation.
- Corrected Codex README install instructions to use the documented personal
  marketplace layout: `~/.agents/plugins/marketplace.json` with local source
  path `./plugins/in-my-voice`.
- Updated the shipped Codex marketplace manifest to use a local source path for
  this plugin repo.

## [0.2.2] - 2026-07-17

### Changed
- README's Gemini CLI, opencode, and generic-harness (Cursor/Windsurf/Pi) install
  instructions now require a full repo clone instead of copying a single file —
  `skills/in-my-voice/SKILL.md` and `AGENTS.md` both depend on `core/` via
  relative paths, so a single-file copy silently broke at runtime.
- Added scenario IDs to the elicitation bank and documented default
  initialization for `customBlocklist` and `limits`.
- Generalized revise-flow output naming from `revised_letter` to
  `revised_draft`, and made `EVIDENCE_MAP` explicitly optional.

## [0.2.1] - 2026-07-17

### Changed
- Renamed the project from `voice-letter` to `in-my-voice`, including plugin
  names, marketplace manifests, repository references, and documentation.
- Moved profile storage references from `~/.voice-letter/profiles/` to
  `~/.in-my-voice/profiles/`.

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
  `~/.in-my-voice/profiles/<name>.json`, agent-neutral and never committed.

### Removed
- `prompts/01-extract-voice-profile.md`, `prompts/02-draft-cover-letter.md`,
  `prompts/03-revise-for-fidelity.md`, and the v0.1.0 schema — superseded by
  `core/flows/*.md` and `core/schemas/voice-profile.schema.json`.
