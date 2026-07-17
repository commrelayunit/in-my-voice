# Flow: Revise For Voice Fidelity And AI-Tells

You are revising a draft against a voice profile and a layered blocklist. Make the piece more faithful, specific, and credible without making it weird. Two passes, run in order.

## Input

```text
VOICE_PROFILE_JSON:
[Load from ~/.voice-letter/profiles/<name>.json]

WRITING_SAMPLE_EXCERPTS:
[A few representative excerpts from the profile's own sources.]

DRAFT:
[Current draft text.]

WRITING_GOAL:
[Same value passed to draft-flow.md — determines which AI-tells categories apply.]
```

## Pass 1: Voice-fidelity

Check the draft's rhythm, paragraph structure, transitions, and lexicon against `VOICE_PROFILE_JSON.traits` and `WRITING_SAMPLE_EXCERPTS`. Flag anywhere the draft drifts from the profile without a good reason (e.g. defaulting to longer, more uniform sentences than the author ever writes).

## Pass 2: AI-tells (additive risk)

Load and merge three layers, broad to narrow:
1. `core/blocklist/ai-tells-baseline.md` — categories 1 (document/paragraph flow) through 6 (individual words). **Skip category 1 and the cover-letter-opener/career-summary-wrapper patterns in category 4 unless `WRITING_GOAL` is an application/persuasive genre** (cover letter, grant application, "why hire me" post). Categories 2, 3, 5, 6 always apply.
2. `core/blocklist/custom-terms.md` — your own git-tracked additions, same severity model, always apply.
3. `VOICE_PROFILE_JSON.customBlocklist` — this profile's own additions, always apply for this profile.

For each match, apply the evidence exceptions from `ai-tells-baseline.md` §"Recommended Lint Logic" before scoring:
- do not flag a phrase that appears naturally in the profile's own samples, unless it's still weakening the piece
- reduce risk when the sentence has concrete evidence (named project, metric, method, role requirement, artifact, product, team, deadline, constraint, result)
- increase risk when a paragraph has no applicant/subject-specific evidence at all

Score additively per `ai-tells-baseline.md` §7.1:
- +3: unevidenced hard-block phrase
- +2: soft-warning phrase in opener, closer, or topic sentence
- +2: body paragraph with no specific evidence
- +1: repeated transition, triad, or rhetorical template
- -2: phrase matches `VOICE_PROFILE_JSON.draftingGuidance.prefer`
- -2: sentence contains concrete evidence

Total the score and classify: 0-2 no issue, 3-5 style review, 6-8 revise before final, 9+ regenerate or run a focused evidence-grounding pass.

For each flag, either delete it, replace it with a concrete claim grounded in `evidence_map`, or keep it with a stated reason (appears in the profile's preferred language, or required by the target opportunity).

## Output

Return:
1. `revised_letter` — the revised draft
2. `change_log` — concise explanation per change
3. `remaining_risks` — factual uncertainty, tone mismatch, or missing evidence
4. `ai_tells_flagged` — list of `{category, pattern, layer, severity, score, rationale}`, plus the total score and its threshold band
