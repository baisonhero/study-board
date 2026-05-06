---
name: using-replica-harness
description: Use at the start of any obsidian_replica conversation - routes the request to the right skill/subagent and enforces TDD before any code change
---

<SUBAGENT-STOP>
If you were dispatched as a subagent (feature_implementer, bug_fixer, commit_push_agent), skip this skill. Read `tdd-discipline` and `replica-conventions` directly and execute your task.
</SUBAGENT-STOP>

# The Iron Law

```
NO PRODUCTION CODE CHANGE WITHOUT A FAILING TEST FIRST.
```

This is the AGENTS.md rule. It overrides default agent behavior. It overrides "this is too small to bother." It overrides "I'm just doing a quick fix."

If you're about to edit `lib/`, `src/`, or `scripts/` without first running `npm run test:lib` against a new failing test, **stop**. Invoke `tdd-discipline` instead.

# Routing

Match the request, then invoke the listed skill / spawn the listed agent. **Don't skip skills "because the change is small."** Small changes are exactly where regressions hide.

| Request shape | What to do |
|---|---|
| "Add / build / implement a feature in `lib/` or `src/`" | Spawn `feature_implementer` subagent. It reads `tdd-discipline` + `replica-conventions`. |
| "Fix a bug" / "X is broken" / "Y returns wrong value" | Spawn `bug_fixer` subagent. It writes a regression test first. |
| "Refactor X" / "clean up Y" | Read `tdd-discipline`. Refactors that change observable behavior need tests first. Pure renames may not. |
| "Sync the Vault" / "publish today's notes" | Spawn `commit_push_agent`. Do NOT use it for source changes. |
| "Update a CSS color" / "change the layout" | Read `replica-conventions` (WCAG AAA, no light mode). For CSS changes that affect rendered HTML, smoke-test still applies. For pure visual tweaks, verify in `npm run dev`. |
| "What does X do?" / explanation requests | Read the code. No skill needed. Don't write code. |
| "Update OTel config" / "change env wiring" | Read `replica-conventions` (OTel section). Confirm with user before touching. |
| "Update a dep" / "bump package X" | Stop. Ask user. Dep bumps go in their own commit and need a `npm run test:lib && npm run typecheck && npm run build` pass before push. |

# Red Flags — STOP and re-route

These thoughts mean you are about to violate the Iron Law:

| Thought | Reality |
|---|---|
| "This is just a one-line change" | One line is enough to cause a regression. Test first. |
| "I'll write the test after, I want to see if my idea works" | You won't. And once it works you'll convince yourself the test is redundant. |
| "TDD slows me down" | Debugging in prod slows the user down. TDD is the fast path. |
| "There's no good way to test this" | Then the design is wrong. Refactor for testability first, or ask. |
| "The smoke test doesn't have a place for this" | Add a section. The whole point of `scripts/smoke-test.mjs` is to grow. |
| "This is just a CSS change, no test needed" | If it changes rendered HTML / `<a href>` / class names, it can break the smoke test or links. Check. |
| "Type checking is enough" | `tsc` finds shape errors, not behavior errors. The user's been bitten by this. |
| "I already manually tested in `npm run dev`" | Manual is ad-hoc. Tests are repeatable. The next agent won't re-do your manual run. |
| "The change is in `content/`" | Don't touch `content/`. Use sync. |

If you catch yourself thinking any of these, invoke `tdd-discipline` and start over.

# Routing flow

```
Request arrives
    │
    ├── Source code change?  → invoke tdd-discipline + replica-conventions
    │       │
    │       ├── New behavior        → spawn feature_implementer
    │       └── Fix wrong behavior  → spawn bug_fixer
    │
    ├── Vault sync?          → spawn commit_push_agent
    ├── Pure docs / question → answer directly
    └── Anything risky       → ask the user before acting
```

# What "risky" means here

Reversibility, not difficulty. Things to confirm before doing:

- Editing `next.config.ts`, `package.json`, `.eslintrc.json`, `tsconfig.json`
- Adding/removing dependencies
- Anything that touches `content/` (use sync, don't hand-edit)
- Force pushes, branch deletes, history rewrites
- Pushing to `main` (Vercel auto-deploys; production sees it within seconds)
- Changing OTel env wiring (broken telemetry is silent — no exception is thrown)

Local edits, new tests, new components in `src/components/` are **not** risky — just go.

# Skill priority

When two skills could apply, run them in this order:

1. **`tdd-discipline`** — first, always. It governs HOW to make the change.
2. **`replica-conventions`** — second. Project-specific rules (slugs, colors, OTel).
3. **Domain-specific reasoning** — last. The actual feature work.

# Honesty gate

Before saying "done" / "fixed" / "passing":

1. State the verification command (`npm run test:lib`, `npm run typecheck`, `npm run build`).
2. Run it in this turn — not "earlier" — and read the output.
3. Quote the relevant line of output ("X passed, 0 failed", "exit 0").
4. Then claim the result.

If you skipped any step, you're not done. You're guessing.
