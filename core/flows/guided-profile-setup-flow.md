# Flow: Guided Profile Setup

You are guiding a new or returning user from "I need a voice profile" to a usable first profile and a small improvement plan. Coordinate `core/flows/organize-samples-flow.md`, `core/flows/capture-flow.md`, `core/flows/draft-flow.md`, and `core/flows/revise-flow.md`. Do not ask the user to understand the schema first.

Profiles are saved only to `~/.in-my-voice/profiles/<name>.json`. Never save raw private samples or generated profile files inside this repo.

## Step 1: Goal and scope

Ask what the profile is for first: academic writing, job materials, formal email, informal/social writing, general work writing, or another concrete use. Recommend the smallest useful starting scope, usually one to three target paths, so setup can finish.

If the user has no profile name, suggest a plain name such as `work`, `academic`, or `personal`, then confirm it.

## Step 2: Initial hierarchy

Run the planning logic from `core/flows/organize-samples-flow.md`. Start with a compact hierarchy matched to the goal. Examples:

- academic first pass: `academic/paper/abstract`, `academic/paper/introduction`, `email/formal/follow-up`
- professional communication first pass: `email/formal/cold-outreach`, `email/formal/follow-up`, `social/professional-network/post`
- everyday writing first pass: `email/informal/coordination`, `social/messenger/short-reply`, `social/messenger/personal-note`

Show the proposed paths and ask for corrections before collecting or classifying samples.

## Step 3: Sample inventory

Ask what samples the user already has. Accept any of:

- pasted text
- file paths or directories to inspect
- a list of sample titles/types for later capture
- no samples yet

For each candidate sample, classify it into the hierarchy. If the user provides file paths, read only files they explicitly point to and avoid copying private sample text into repo files or task artifacts.

## Step 4: Minimum viable profile

Run `core/flows/capture-flow.md` for the available samples and targeted elicitation. Build a first profile even when confidence is uneven, but mark low-confidence branches clearly in `sampleSummary.hierarchy` and `contextSlices`.

If there are zero samples, use short elicitation prompts from `core/elicitation-bank.md` to seed only the requested contexts. Do not run an interview marathon; collect enough to produce a useful low-confidence first profile and a next-step plan.

## Step 5: Gap filling

Identify missing or weak branches. Use targeted prompts only where they improve a branch the user actually needs. Prefer realistic writing tasks over style self-report.

Examples:

- for `email/formal/cold-outreach`: "Write a short first-contact email asking for a 20-minute meeting."
- for `academic/paper/abstract`: "Write a 3-sentence summary of a project: problem, method, contribution."
- for `social/messenger/coordination`: "Reply to a colleague to schedule a quick check-in when your week is crowded."

Append elicited responses with `type: "elicited"`, `scenarioId` when taken from the bank, and `samplePath` when the prompt targets a branch.

## Step 6: Validate and save

Before saving, validate the profile against `core/schemas/voice-profile.schema.json`. Preserve `version: "0.2.0"` and include optional hierarchy fields only when they are supported by evidence. Save to `~/.in-my-voice/profiles/<name>.json` after confirmation.

Existing flat `0.2.0` profiles remain valid. When onboarding updates an old profile, classify old sources only with user confirmation; otherwise leave them global and note the migration gap in `sampleSummary.hierarchyNotes`.

## Step 7: Test draft and revision

Ask for one small test task in a target context, or propose one based on the profile goal. Run `core/flows/draft-flow.md` using the selected context slice, then run `core/flows/revise-flow.md` to catch voice drift and AI-tells. Keep the test draft short.

Show:

- the selected `targetSamplePath`
- the draft or rewrite
- one or two voice-fidelity notes
- any confidence caveat

## Step 8: Next-step plan

Finish with a concrete checklist:

- branches that are ready
- branches that need more samples
- suggested next samples or elicitation prompts
- whether to keep one profile with `contextSlices` or split into separate profiles later

## Output

Return:

1. `profile_path` — saved path or proposed path under `~/.in-my-voice/profiles/`
2. `hierarchy_capture_plan` — structured plan from `organize-samples-flow.md`
3. `trait_confidence_summary` — global and per-branch confidence
4. `missing_sample_branches` — paths that need more evidence
5. `recommended_next_samples` — small, concrete additions
6. `test_draft_or_rewrite` — short output from the selected context
7. `validation_status` — schema validation result or exact blocker
