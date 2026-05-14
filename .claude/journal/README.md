# `.claude/journal/` — Append-Only Mistake Log

This directory is the **observation layer** of the obsidian_replica self-improvement loop.

It records project-specific mistakes, surprises, decisions, and incidents that future agents (and the `code_reviewer`) should remember. It is **append-only**: never edit or delete an entry. If a fact turns out wrong, write a new entry that supersedes it.

This is the Single Source of Truth for journal schema. AGENTS.md, the `code_reviewer` agent, and the `using-replica-harness` skill all defer to this file for the format.

---

## What goes here

Project-specific lessons. Things that:

- Are not derivable from reading the current code (the code shows what *is*, not what *was tried and failed*).
- Are not already captured in `AGENTS.md` / skills (if they should be, the next `retro` pass will promote them).
- A fresh agent walking into this repo cold would be likely to repeat without a warning.

**Do NOT log:**

- Generic Claude-Code best practices (those belong in skills, not here).
- Routine successes (only log a success if the *approach* was non-obvious and worth repeating).
- Detailed code diffs (the git history has those — link to the SHA).
- Anything personal or sensitive about the user.

---

## File naming

```
YYYY-MM-DD-<short-slug>.md
```

- `YYYY-MM-DD` is the date of the *event*, not necessarily the date of writing. Use the absolute date — never "yesterday".
- `<short-slug>` is 2–5 hyphenated words describing the lesson, not the symptom. Good: `harness-rehydration`, `worktree-checkout-main`. Bad: `bug`, `fix-1`, `oops`.

If two entries collide on the same date, append `-2`, `-3`, … to the slug.

---

## Frontmatter schema

```yaml
---
date: YYYY-MM-DD          # required, absolute
type: mistake | surprise | decision | incident   # required, exactly one
trigger: <one short line — what activated this entry>
severity: low | med | high   # required
supersedes: <filename>    # optional — point at an older entry this corrects
---
```

`type` semantics:

- **`mistake`** — an agent (or the user) did something wrong and we want to prevent recurrence.
- **`surprise`** — the system behaved differently from expectation; not necessarily anyone's fault, but worth flagging.
- **`decision`** — a non-obvious choice was made; record the *why* so it isn't unwound later.
- **`incident`** — something user-visible broke (production deploy, lost work, leaked token).

`severity`:

- **`low`** — would cost minutes if repeated.
- **`med`** — would cost a working session or require a manual fix.
- **`high`** — would cost the user trust, data, or a deploy. Reviewer must always block on `high`.

---

## Body structure

Three sections, in order:

```markdown
## What happened

Two to four sentences. Concrete. Include file paths, commit SHAs, command names.

## Why it happened

Root cause — not the symptom. Often a missing assumption, a stale mental model, or a difference between the harness's environment and the agent's expectation.

## Signal for next session

One imperative sentence aimed at a future agent or the `code_reviewer`. Start with "Reviewer should…" or "Future agent should…" so the line is grep-able.
```

The **Signal** line is the load-bearing part. The `code_reviewer` agent reads recent journal entries and uses these signals as additional checks against the current diff. Make every signal specific enough to act on.

---

## When to write an entry

Mandatory:

- A `feature_implementer` or `bug_fixer` run hit an Iron Law violation, an environment surprise, or a wrong-shape spec — write before reporting back.
- The user said "no, that's wrong" / "stop doing that" / "you broke X" — write before continuing.
- A `npm run test:lib` failure surfaced a class of mistake (not the bug itself — the class).
- An incident reached Vercel / production / a Vault sync mishap.

Strongly encouraged:

- A non-obvious decision was reached that future agents would naturally undo.
- An interaction between two parts of the harness (skills + agents + hooks) behaved unexpectedly.

Skip when:

- The lesson is already cleanly captured in AGENTS.md or a skill — update *that* file instead.
- The mistake was generic to LLMs, not specific to this repo.

---

## When to read entries

Mandatory:

- At the start of any session that will modify code, the top-level routing skill (`using-replica-harness`) reads the most recent 3–5 entries.
- The `code_reviewer` agent reads the most recent 5 entries before judging a diff.

Encouraged:

- Before answering a question that smells like one already debugged ("why isn't X working" → search the journal first).

---

## Lifecycle

- **Write:** create a new file. Done.
- **Correct:** create a *new* file with `supersedes: <old-file>` in frontmatter. Do not edit the old one.
- **Promote:** when `retro` runs and a recurring pattern crosses the bar, the lesson moves into `AGENTS.md` or a skill. The journal entries stay (history).
- **Archive:** never. The journal is the long memory of the project.

---

## Template

See `_template.md` for a copy-paste skeleton.
