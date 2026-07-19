---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview me relentlessly about every aspect of this until we reach a shared understanding. Walk down each branch of the decision tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is confusing.

If a *fact* can be found by exploring the environment (filesystem, tools, etc.), look it up rather than asking me. The *decisions*, though, are mine — put each one to me and wait for my answer.

Do not act on it until I confirm we have reached a shared understanding.

## Saving the outcome

Once every decision is resolved (no open questions left), save the shared understanding to `/specify/specify-<feature-name>.md`, where `<feature-name>` is a kebab-case slug for the thing being grilled. This doc is an input to a later spec/PRD-generation step, not the PRD itself — keep it to the decisions reached, not user stories or testing plans.

Use this template:

```
# Specify: <Feature Name>

## Source
What prompted this (e.g. link/reference to the brief or conversation that kicked off the grilling).

## Context
Short paragraph: what we're building and why, in plain terms.

## Decisions
Numbered list, each as:
N. **<Decision topic>** — <what was decided>
   - Why: <reasoning/tradeoff, if non-obvious>
```

Confirm the feature-name slug with me before writing the file if it isn't obvious from the conversation.
