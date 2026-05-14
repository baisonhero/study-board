---
date: 2026-05-09
type: decision
trigger: User flagged the absence of a feedback loop in the harness; rehydration also exposed a worktree-vs-main pitfall.
severity: med
---

## What happened

The harness landed on `main` at `ec7a2dd` (`feat(harness): set up agent harness with TDD-first discipline`) — three subagents (`feature_implementer`, `bug_fixer`, `commit_push_agent`), three skills (`using-replica-harness`, `tdd-discipline`, `replica-conventions`), and `AGENTS.md`. That commit was reached by fast-forwarding the local `main` to `origin/main` after an earlier branch had drifted; the actual harness work had been done in a sibling worktree, then promoted.

The user then pointed out that this configuration is purely static: a discipline manual plus implementer agents, with no observation, criticism, or distillation step. There is no mechanism by which today's mistakes feed tomorrow's behavior. We're adding a four-layer self-improvement loop in this same session — observation (`.claude/journal/`), criticism (`code_reviewer` agent), distillation (`retro` skill, scaffold only), and codification (AGENTS.md / skill updates after retro).

In the course of doing the rehydration, a Claude Code session running in a worktree (`.claude/worktrees/<name>`) cannot run `git checkout main` when `main` is checked out by another worktree — git refuses with `fatal: 'main' is already checked out at <other path>`. The workaround is to `cd` into the main worktree's directory and operate there, or to push the branch and let the main worktree fast-forward.

## Why it happened

Two distinct gaps:

1. **Loop gap.** The harness was built as instructions ("do TDD") and executors ("here's an agent that does TDD"), but skipped the GAN-style adversary that would catch when an executor cheats. With no journal and no reviewer, the same class of mistake can repeat indefinitely without leaving a trace in the harness.

2. **Worktree gap.** Agents instinctively reach for `git checkout main` when a task says "commit to main". Inside a Claude Code worktree, that command fails — and the failure is easy to misread as "git is broken", not "this command is wrong for my context". The correct mental model is: each worktree owns one branch, and main lives in *its* worktree.

## Signal for next session

- Reviewer should flag bare `git checkout main` calls when the working directory is under `.claude/worktrees/`. Suggest `cd <main-worktree-path>` instead, or pushing the current branch and fast-forwarding from the main worktree.
- Reviewer should treat any agent change that adds an executor (subagent) without a corresponding observation/journaling hook as incomplete — every executor should leave at least one journal entry per run on failure paths.
- Future agent should not assume `main` can be checked out locally just because the user said "commit to main"; check `git worktree list` first.
