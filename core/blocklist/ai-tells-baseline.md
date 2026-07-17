# AI-Tells Baseline Blocklist

Date: 2026-07-17

Project: `commrelayunit/voice-letter`

Purpose: structure generated-text giveaways from broadest to narrowest signal, for use by `core/flows/revise-flow.md` as an additive-risk lint against any piece of writing — not only cover letters.

Important caveat: this is not an AI detector. Use these signals to catch generic, voice-breaking, or evidence-free prose. A human can write this way too, and a generated draft can avoid many of these signs.

**Genre scoping:** Section 1 ("Document And Paragraph Flow") and the cover-letter-opener / career-summary-wrapper patterns in §4.1–4.2 are application-genre-specific (cover letters, grant applications, "why hire me" posts). Skip them when `WRITING_GOAL` is not an application/persuasive genre — they will misfire on a casual email or social post. Sections 2, 3, 5, and 6 are genre-agnostic and always apply.

## Recommended Lint Logic

Use additive risk, not binary detection.

- **Hard block**: the pattern replaces evidence with an unsupported claim.
- **Soft warning**: the pattern is often generic, over-polished, or associated with LLM-shaped prose, but may be acceptable in context.
- **Style review**: the pattern is only suspicious when repeated or mismatched with the author's voice profile.

Evidence exceptions:

- Do not flag a phrase that appears naturally in the author's writing samples unless it is still weakening the cover letter.
- Reduce risk when the sentence includes concrete evidence: named project, publication, metric, method, role requirement, artifact, product, team, deadline, constraint, or result.
- Increase risk when a paragraph contains no applicant-specific evidence.

## 1. Document And Paragraph Flow

These are the strongest signals because they capture how the whole letter is moving.

### 1.1 Template-Like Paragraph Shape

Pattern:

- four or five paragraphs of similar length
- each paragraph has the same internal arc: polite opener, broad claim, abstract value statement, warm transition
- every paragraph ends by saying why something "matters" without adding new evidence

Examples:

- "This experience has shaped my ability to drive meaningful impact."
- "Together, these experiences make me well suited to contribute to your team."
- "I am excited by the opportunity to bring this perspective to your organization."

Action: **style review**, escalating to **hard block** when body paragraphs lack evidence.

False-positive risk: medium. Formal applications can be structurally tidy. The issue is tidy structure plus low specificity.

### 1.2 Evidence-Free Body Paragraph

Pattern:

- a body paragraph contains no named project, role requirement, method, result, metric, artifact, publication, team, product, or constraint
- the paragraph summarizes traits instead of proving fit

Examples:

- "My background has prepared me to collaborate effectively across disciplines."
- "I bring strong analytical skills and a commitment to meaningful outcomes."

Action: **hard block** for body paragraphs.

False-positive risk: low. This is a quality problem even when human-written.

### 1.3 Generic Opening Flow

Pattern:

- starts with enthusiasm and interest before giving a concrete reason
- names the role but not the applicant's specific fit

Examples:

- "I am excited to apply for..."
- "I am writing to express my interest in..."
- "This opportunity immediately stood out to me..."

Action: **soft warning**. Rewrite the opening around a concrete match.

Allowed context: conservative application norms, rigid forms, or when the author's real writing uses this convention.

### 1.4 Generic Closing Flow

Pattern:

- thanks the reader
- restates confidence
- says they look forward to discussing
- adds no new specific reason for fit

Examples:

- "I look forward to the opportunity to discuss my application."
- "Thank you for considering my application."
- "I am confident that my skills and experience make me a strong candidate."

Action: **soft warning**, escalating if the close repeats earlier claims verbatim.

## 2. Paragraph-Level Rhetorical Moves

These are recurring argument patterns that make prose sound polished but non-specific.

### 2.1 Unsupported Fit Claim

Pattern:

- claims special fit without narrowing the basis for that fit

Examples:

- "I am uniquely qualified."
- "I am ideally positioned."
- "I am the perfect fit."
- "I am the best person for the job."

Action: **hard block unless evidenced** in the same sentence or immediately following sentence.

False-positive risk: medium. It can work only when followed by specific proof.

### 2.2 Abstract Impact Claim

Pattern:

- promises value without mechanism

Examples:

- "drive meaningful impact"
- "make a difference"
- "create value"
- "contribute to success"
- "shape the future"

Action: **soft warning**. Ask: impact on what, by doing what, using which evidence?

### 2.3 Inflated Symbolism

Pattern:

- uses grand metaphor to decorate ordinary experience

Examples:

- "a testament to my dedication"
- "a beacon of innovation"
- "a tapestry of experience"
- "my journey has shaped..."

Action: **soft warning**.

Allowed context: creative/brand voice where the author actually writes this way.

### 2.4 Over-Explained Professional Virtues

Pattern:

- devotes paragraph space to virtues expected of any applicant

Examples:

- communication
- teamwork
- adaptability
- attention to detail
- motivation
- responsibility

Action: **hard block unless tied to concrete evidence**.

## 3. Sentence Structure And Rhythm

These patterns are weak alone but useful when repeated.

### 3.1 Balanced Triads

Pattern:

- repeated three-part lists of broad virtues

Examples:

- "collaboration, innovation, and impact"
- "strategy, execution, and communication"
- "curiosity, rigor, and adaptability"

Action: **style review**.

False-positive risk: high. Triads are common human rhetoric. Flag repetition and genericity, not one instance.

### 3.2 Not-Only-But-Also Scaffolding

Pattern:

- repeated contrast structure used as a default intensifier

Examples:

- "not only X, but also Y"
- "not just X, but Y"

Action: **style review**. Rewrite if it appears more than once or does not express a real contrast.

### 3.3 Long Polished Payoff Sentence

Pattern:

- sentence starts with evidence-like setup, shifts to broad values, ends with a polished abstract payoff

Example shape:

```text
Through [experience], I developed [broad skill], enabling me to [abstract impact] in [broad environment].
```

Action: **style review**. Replace the payoff with a concrete next-step value.

### 3.4 Nominalization Stack

Pattern:

- abstract nouns hide who did what

Examples:

- "my contribution to the execution of strategic initiatives"
- "the development of meaningful outcomes"
- "alignment with organizational objectives"
- "collaboration on impactful solutions"

Action: **style review**, escalating when the sentence has no concrete verb.

### 3.5 Over-Neat Paragraph Balance

Pattern:

- paragraphs have nearly identical length and sentence count
- transitions appear at predictable positions

Action: **style review**. Compare against the author's voice profile.

## 4. Phrase Templates

These are reusable chunks that often sound generated or form-letter-like.

### 4.1 Cover-Letter Openers

Examples:

- "I am excited to apply for..."
- "I am writing to express my interest in..."
- "I was thrilled to see..."
- "This opportunity aligns perfectly with..."

Action: **soft warning**.

Better rewrite target:

- open with the concrete match between the role and the applicant's evidence

### 4.2 Career Summary Wrappers

Examples:

- "Throughout my career..."
- "With a proven track record..."
- "My diverse background has equipped me..."
- "I bring a unique combination of..."

Action: **soft warning**, or **hard block** if no evidence follows.

### 4.3 Generic Confidence Phrases

Examples:

- "I am confident that my skills and experience make me..."
- "I believe I would be a valuable addition..."
- "I am well positioned to contribute..."
- "I would be honored to contribute..."

Action: **soft warning**.

### 4.4 Dynamic Context Setups

Examples:

- "in today's fast-paced landscape"
- "in an ever-evolving world"
- "in a rapidly changing environment"
- "in the dynamic field of..."

Action: **soft warning**.

Allowed context: strategy or policy roles where the context is named specifically.

### 4.5 Generic Transitions

Examples:

- "Moreover"
- "Furthermore"
- "Additionally"
- "In conclusion"

Action: **style review**.

False-positive risk: high, especially in formal academic applications.

## 5. Claims And Trait Words

These often replace proof with personality labels.

### 5.1 Generic Virtues

Examples:

- "hard worker"
- "team player"
- "self-starter"
- "detail-oriented"
- "problem-solver"
- "quick learner"
- "strong communicator"
- "excellent communication skills"

Action: **hard block unless evidenced**.

Allowed context: quoted from the job description and immediately paired with proof.

### 5.2 Inflated Applicant Labels

Examples:

- "dynamic"
- "proactive"
- "motivated"
- "responsible"
- "adaptable"
- "passionate"

Action: **soft warning**, escalating when clustered.

### 5.3 Empty Credential Wrappers

Examples:

- "proven track record"
- "demonstrated ability"
- "extensive experience"
- "deep expertise"
- "strong background"

Action: **hard block unless followed by named evidence**.

## 6. Individual Words

These are the weakest signals. Use them as soft warnings only.

### 6.1 LLM-Overrepresented Or AI-Ish Diction

Examples:

- "delve"
- "intricate"
- "underscore"
- "realm"
- "showcase"
- "boast"
- "garner"
- "surpass"
- "aligns"
- "groundbreaking"

Action: **soft warning**.

False-positive risk: high. Some are normal in academic or professional prose.

### 6.2 Polished Abstract Nouns

Examples:

- "landscape"
- "journey"
- "impact"
- "alignment"
- "contribution"
- "innovation"
- "collaboration"
- "execution"

Action: **style review** unless clustered or unsupported.

### 6.3 Inflated Tone Words

Examples:

- "robust"
- "seamless"
- "holistic"
- "transformative"
- "impactful"
- "meaningful"

Action: **soft warning**.

## 7. Implementation Shape For Voice Letter

### 7.1 Suggested Severity Model

- +3: hard-block phrase without evidence
- +2: soft-warning phrase in opener, closer, or topic sentence
- +2: body paragraph with no applicant-specific evidence
- +1: repeated transition, triad, or rhetorical template
- -2: phrase appears in the voice profile's preferred language
- -2: sentence contains concrete evidence

Thresholds:

- 0-2: no issue
- 3-5: style review
- 6-8: revise before final
- 9+: regenerate or run a focused evidence-grounding pass

### 7.2 Prompt Instruction

```text
Review the letter for generic generated-cover-letter language. Do not infer authorship. Flag only phrases that weaken voice fidelity or replace supplied evidence.

Work from broad to narrow:
1. paragraph flow and evidence grounding
2. paragraph-level rhetorical moves
3. sentence rhythm and structure
4. phrase templates
5. individual words

For each flag, delete it, replace it with a concrete claim grounded in the evidence_map, or keep it with a reason if it appears in the author's voice profile or is required by the target opportunity.
```

## 8. Compact Block List

Hard block unless evidenced:

- "uniquely qualified"
- "ideal candidate"
- "perfect fit"
- "best person for the job"
- "hard worker"
- "team player"
- "self-starter"
- "detail-oriented"
- "quick learner"
- "excellent communication skills"
- "proven track record"
- "demonstrated ability"
- "thrive in a fast-paced environment"

Soft warning:

- "I am excited to apply"
- "I am writing to express my interest"
- "throughout my career"
- "I would be honored"
- "I am confident that my skills and experience"
- "aligns perfectly with"
- "drive meaningful impact"
- "make a difference"
- "dynamic landscape"
- "ever-evolving landscape"
- "delve"
- "intricate"
- "underscore"
- "realm"
- "showcase"
- "testament"
- "tapestry"
- "beacon"

Style review:

- repeated triads
- repeated "not only X, but also Y"
- same-shaped paragraphs
- evidence-free body paragraph
- repeated "Moreover", "Furthermore", "Additionally", "In conclusion"
- nominalization stacks
- over-neat paragraph balance

## Sources

- Schuster, Roe, Shah, and Barzilay. "The Limitations of Stylometry for Detecting Machine-Generated Fake News." Computational Linguistics, 2020. https://aclanthology.org/2020.cl-2.8/
- "A Practical Examination of AI-Generated Text Detectors for Large Language Models." Findings of NAACL, 2025. https://aclanthology.org/2025.findings-naacl.271/
- Liang, Yuksekgonul, Mao, Wu, and Zou. "GPT detectors are biased against non-native English writers." Patterns, 2023. https://scale.stanford.edu/publications/gpt-detectors-are-biased-against-non-native-english-writers
- Juzek and Ward. "Why Does ChatGPT 'Delve' So Much? Exploring the Sources of Lexical Overrepresentation in Large Language Models." COLING, 2025. https://aclanthology.org/2025.coling-main.426/
- Fredrick and Craven. "Lexical diversity, syntactic complexity, and readability: a corpus-based analysis of ChatGPT and L2 student essays." Frontiers in Education, 2025. https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1616935/full
- Idealist. "Cover Letter Cliches to Avoid." https://www.idealist.org/en/careers/cover-letter-cliches
- The Muse. "5 Cliche Cover Letter Lines to Avoid at All Costs." https://www.themuse.com/advice/5-cliche-cover-letter-lines-to-avoid-at-all-costs
- Krishna, Song, Karpinska, Wieting, and Iyyer. "Paraphrasing evades detectors of AI-generated text, but retrieval is an effective defense." NeurIPS, 2023. https://papers.nips.cc/paper_files/paper/2023/hash/575c450013d0e99e4b0ecf82bd1afaa4-Abstract-Conference.html
