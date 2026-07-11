---
name: google-promptwars
description: Helps draft, refine, and evaluate competitive prompts for Google PromptWars. Use when brainstorming prompt strategies, improving clarity, or iterating on contest entries.
---

# Google PromptWars

Use this skill when working on prompts for Google PromptWars.

## Goals

- Generate strong first-draft prompts quickly
- Improve prompts through short iteration loops
- Make prompts clearer, more constrained, and easier for a model to follow
- Explore multiple prompt strategies before choosing one

## Workflow

1. Restate the task in one sentence.
2. Identify the desired output format.
3. List key constraints, scoring criteria, or hidden failure modes.
4. Explicitly optimize for these judging criteria, with priority weighting:
   - code quality (highest priority)
   - security (highest priority)
   - dynamic site behavior / interactive UX (high priority)
   - efficiency
   - testing
   - accessibility
   - problem statement alignment
5. Draft 3 different prompt approaches:
   - direct and concise
   - structured with steps
   - role/context-driven
6. Compare the drafts and pick the strongest one.
7. Refine for brevity, precision, and reliability.
8. If needed, produce a final submission version plus 2 backups.

## Prompt Design Checklist

Before finalizing, check whether the prompt:

- clearly defines the task
- specifies the expected output
- includes constraints and edge cases
- avoids ambiguity
- is short enough to stay efficient
- uses formatting that improves compliance
- asks for clean, maintainable code quality
- asks for secure handling of inputs, data, and dependencies
- asks for a dynamic, responsive, interactive site when the task involves a web app
- asks for efficient implementation choices
- asks for tests or validation coverage
- asks for accessible UX, naming, and interaction patterns when relevant
- stays tightly aligned to the problem statement without overbuilding
- gives extra emphasis to code quality and security over secondary polish

## Recommended Output Modes

Depending on the user's request, produce one of these:

### 1. Quick Prompt

A single polished prompt with no explanation.

### 2. Prompt Pack

Return:
- `Version A`
- `Version B`
- `Version C`
- `Best choice`
- `Why it is strongest`

### 3. Iteration Mode

Return:
- current prompt
- weaknesses
- improved prompt
- optional aggressive/creative variant

### 4. Submission Safety Mode

Use this when the user says things like `improve submission`, `should I resubmit`, or asks for a final pre-submit review.

Return:
- `Current score risks`
- `Genuine improvement opportunities`
- `Recommendation: keep or resubmit`
- `Reason for recommendation`
- `Revised submission` only if the improvement is materially stronger

## Master PromptWars Coding Prompt

Use or adapt this when the task is to generate a competitive coding submission:

```text
Build the strongest possible solution for the given problem statement.

Primary judging priorities, in order:
1. Code quality
2. Security
3. Dynamic site behavior / interactivity
4. Problem statement alignment
5. Efficiency
6. Testing
7. Accessibility

Instructions:
- Follow the problem statement exactly. Do not invent extra scope unless it directly strengthens the required solution.
- Produce clean, modular, maintainable code with clear naming and separation of concerns.
- Prefer secure defaults: validate inputs, avoid unsafe patterns, minimize sensitive exposure, and avoid common vulnerabilities.
- If this is a web task, create a genuinely dynamic and interactive experience with solid state handling, clear feedback, and polished flows.
- Keep the implementation efficient and avoid unnecessary complexity.
- Include meaningful test coverage or at least a clear testing strategy with edge cases.
- Ensure accessibility where relevant using semantic structure, keyboard support, readable content, and sensible labels.
- Make implementation choices that maximize judging performance, especially for code quality and security.
```

## Submission Risk Policy

The user has only 3 submission attempts, and a resubmission can improve or reduce the score.

When the user asks to `improve submission`, `revise`, or `make it better`:

- Do **not** change the submission by default.
- First evaluate whether there is a **genuine, material improvement**.
- Only propose a rewrite if it is likely to improve high-priority judging criteria, especially code quality, security, or dynamic site behavior.
- If the current submission is already strong and changes are mostly stylistic, recommend keeping it.
- Clearly say when a suggested change is high-confidence vs low-confidence.
- Be conservative: preserve attempts unless there is a real expected gain.
