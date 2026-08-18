# Changelog

All notable changes to `in-my-voice` are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this
project uses [Semantic Versioning](https://semver.org/).

## [0.2.8] - 2026-08-18

### Added
- Added a real Pi package surface with `package.json` metadata and
  `pi.extensions` pointing at `src/index.ts`.
- Added the `/imv` Pi command with completions for `profile`, `capture`,
  `organize`, `draft`, and `revise`.
- Added Pi extension tests covering package metadata, command registration,
  profile selection, profile listing, flow surfacing, and atomic config writes.

### Changed
- `/imv profile` stores only the selected profile name in Pi config and lists
  profiles from `~/.in-my-voice/profiles/*.json` without reading profile
  contents.
- `/imv capture`, `/imv organize`, `/imv draft`, and `/imv revise` now render
  the authoritative `core/flows/*.md` files instead of forking workflow rules.
- Bumped Claude and Codex plugin manifests for the public surface change.

## [0.2.7] - 2026-08-18

### Added
- Added SLYE-derived AI-tells guidance for plain-meaning rewrites, corporate
  jargon and slogans, preamble leakage, and simplification that drops
  constraints, caveats, literals, or Markdown/code structure.
- Added `docs/pi-extension-plan.md` describing a future command-driven Pi
  extension surface for profile selection, capture, organization, drafting, and
  revision.

### Changed
- Revise flow now explicitly preserves target language, intentional language
  mix, facts, literals, Markdown/code, conditions, qualifications, caveats, and
  instructions while replacing clichés or jargon with plain meaning.
- README now separates current generic Pi/rules usage from the planned Pi
  package surface.

## [0.2.6] - 2026-07-18

### Added
- Added optional hierarchy-aware profile fields for `sources[].samplePath`,
  `sampleSummary.hierarchy`, `sampleSummary.hierarchyNotes`, and
  `contextSlices` while preserving compatibility with existing `0.2.0`
  profiles.
- Added sample-organization and guided-profile-setup flows for planning profile
  hierarchies, capture plans, validation, and first test drafts.

### Changed
- Capture, draft, and revise flows now prefer relevant context slices for mixed
  profiles and document fallback behavior for legacy flat profiles.

## [0.2.5] - 2026-07-17

### Changed
- Added `scripts/install-codex.sh` so headless Codex CLI users can install with
  one command instead of manually cloning and creating the skill symlink.
- Updated README Codex instructions to lead with the installer while preserving
  marketplace and manual fallback details.

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
