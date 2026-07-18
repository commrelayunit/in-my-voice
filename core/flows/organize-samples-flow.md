# Flow: Organize Writing Samples

You are helping the person plan or audit the hierarchy for a voice profile. This flow works from a rough inventory, file list, pasted titles, or a description of available writing. Do not require raw private samples up front. Do not store samples in the repo.

## Input

```text
PROFILE_NAME:
[New or existing profile name.]

PROFILE_JSON (optional):
[Load from ~/.in-my-voice/profiles/<name>.json when updating or auditing.]

SAMPLE_INVENTORY:
[List of sample titles, file paths, channels, genres, audiences, or rough descriptions. Raw text is optional.]

PROFILE_GOAL:
[What this profile should support: academic writing, formal email, social posts, general work writing, etc.]
```

## Step 1: Establish scope

Ask what the profile should help with first. Recommend a narrow first pass when the goal is specific, such as academic abstracts or formal outreach, and a broader hierarchy only when the user has enough samples to support it.

## Step 2: Classify inventory

Map each listed sample or sample type to a slash-separated `samplePath`. Use clear, stable labels such as:

- `academic/paper/abstract`
- `academic/paper/introduction`
- `academic/review/review-response`
- `academic/proposal/research-statement`
- `email/formal/cold-outreach`
- `email/formal/follow-up`
- `email/informal/coordination`
- `social/professional-network/post`
- `social/messenger/short-reply`
- `social/messenger/coordination`

If a sample could fit more than one path, choose the path that best reflects how the writing should be reused for drafting, then note the ambiguity.

## Step 3: Decide what must stay separate

Identify contexts that should not be averaged together because their voice signals differ meaningfully. Keep academic prose separate from email, formal email separate from informal coordination, and public posts separate from messenger replies unless the user explicitly wants a broad, low-specificity profile.

## Step 4: Recommend sample counts

For each proposed path, set a realistic target:

- 1 sample: enough to seed the branch, low confidence or `usable_but_thin`
- 2-3 samples: useful for narrow drafting, medium confidence
- 4-5 samples: stronger for email, social, and repeated professional formats
- 3+ substantial samples: stronger for academic sections where structure matters

Mark each branch as `ready`, `usable_but_thin`, `needs_samples`, `needs_elicitation`, `conflicting`, `out_of_scope`, `merge_candidate`, or `defer`.

## Step 5: Choose profile structure

Recommend one profile with context-specific slices when the samples belong to one person's related writing life and the user wants shared global traits. Recommend separate profiles when the audiences, languages, roles, or disclosure boundaries should not mix.

## Step 6: Produce a capture plan

Return a structured plan that the capture flow can consume:

```json
{
  "profilePlanName": "work-writing",
  "profileMode": "new",
  "recommendedHierarchy": [
    {
      "path": "academic/paper/abstract",
      "purpose": "Dense research framing and contribution statements",
      "sampleCountTarget": 3,
      "currentSampleCount": 1,
      "status": "needs_samples",
      "candidateSamples": ["CHI abstract 2025"],
      "elicitationIdeas": ["Ask for a 3-sentence project contribution summary."]
    },
    {
      "path": "email/formal/cold-outreach",
      "purpose": "First-contact professional email style",
      "sampleCountTarget": 5,
      "currentSampleCount": 0,
      "status": "needs_elicitation",
      "candidateSamples": [],
      "elicitationIdeas": ["Write a short first-contact email asking for a meeting."]
    }
  ],
  "separationRules": [
    "Do not mix academic prose and messenger replies when inferring sentence rhythm.",
    "Use professional social posts only for public-facing announcements, not private email drafting."
  ],
  "nextCaptureSteps": [
    {
      "path": "academic/paper/abstract",
      "action": "capture_existing_sample",
      "prompt": "Add two more abstracts or short contribution summaries."
    }
  ],
  "profileRecommendation": "Use one profile with contextSlices because the contexts share a professional voice but need separate drafting behavior."
}
```

## Step 7: Handoff to capture

If the user wants to proceed, pass `recommendedHierarchy`, `separationRules`, and `nextCaptureSteps` into `core/flows/capture-flow.md`. Capture should save only the final profile at `~/.in-my-voice/profiles/<name>.json` and should store sample paths in `sources[].samplePath`, `sampleSummary.hierarchy`, and `contextSlices` where evidence supports them.
