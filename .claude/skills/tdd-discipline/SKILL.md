---
name: tdd-discipline
description: Use before any code change in obsidian_replica - enforces Red-Green-Refactor against the scripts/smoke-test.mjs harness, including UI/CSS changes that affect rendered HTML
---

# TDD Discipline — obsidian_replica

## The Iron Law

```
NO PRODUCTION CODE CHANGE WITHOUT A FAILING TEST FIRST.
```

If you cannot point at a test that failed before your change and passes after, you have not done TDD. **Delete the code and start over.**

## Scope

Applies to:

- Anything under `lib/` (markdown, wiki-links, search, graph)
- Anything under `src/` that has observable output (rendered HTML, route handlers, component DOM)
- Anything under `scripts/` (yes, scripts get tested too — extend the smoke test or add a sibling)

Exempt (ask user first):
- Pure config (`next.config.ts`, `tailwind.config.ts`, `tsconfig.json`)
- Pure visual CSS that doesn't change classnames or HTML structure
- Generated code / dependency bumps
- Documentation, READMEs, comments

If you're not sure if it's exempt, **assume it's not exempt** and write the test.

## The test harness

There is **one** test command:

```bash
npm run test:lib
```

It runs `scripts/smoke-test.mjs` via:

```
node --experimental-strip-types --import='...register ts-loader.mjs...' scripts/smoke-test.mjs
```

That means:

- Test files are `.mjs` (ESM) but can `await import("../lib/markdown.ts")` directly thanks to `scripts/ts-loader.mjs`.
- TypeScript types are stripped at runtime by Node ≥22.6 (`--experimental-strip-types`). No tsc step.
- The `assert(condition, msg)` helper at the top of `smoke-test.mjs` counts pass/fail and exits non-zero on any failure.

**You extend this file.** You do not introduce a new framework. Vitest/Jest/Playwright are not on the table without explicit user approval.

### Where to add tests

`scripts/smoke-test.mjs` is organized by section (`=== getAllNotes ===`, `=== link index ===`, …). Add a new section for new behavior:

```javascript
console.log("\n=== slugify edge cases ===");
const { slugify } = await import("../lib/markdown.ts");  // (export it first)
assert(slugify("") === "untitled", "empty input falls back to 'untitled'");
assert(slugify("  hello  world  ") === "hello-world", "collapses whitespace runs");
```

If a behavior needs more than ~10 assertions or fixtures, create a sibling `scripts/<area>-test.mjs` and add a `test:<area>` script to `package.json` that runs alongside `test:lib`. Discuss with the user first.

### Tests against `content/`

The current smoke test is *integration-flavored* — it runs against the real `content/` directory after `npm run sync`. That means:

- Tests depend on the user's Vault. That's intentional: the user's Vault is the canonical edge-case generator (Japanese filenames, weird wikilinks, drop caps).
- For unit-level edge cases (empty input, malformed frontmatter), construct fixtures inline — don't add files to `content/`.
- If a test needs a temp Vault, build one in a `mkdtemp` dir and point a fresh function at it. Don't mutate `content/`.

## Red → Green → Refactor

### 1. RED — write the failing test

One behavior per test. Clear name. Real code (no mocks unless unavoidable).

```javascript
// In scripts/smoke-test.mjs
console.log("\n=== empty-string slug fallback ===");
assert(slugify("") === "untitled",
  `slugify("") returns "untitled" (got "${slugify("")}")`);
```

### 2. Verify RED — watch it fail

```bash
npm run test:lib
```

Confirm:
- The new assertion fails (not the whole script erroring out)
- Failure message matches what you expect
- Failure is because the feature is missing, not because of a typo

If it errors instead of failing → fix the typo, re-run.
If it passes immediately → you're testing existing behavior. Pick a different assertion.

### 3. GREEN — minimal code

Smallest change that makes the test pass. No extra features. No "while I'm here" cleanups.

```typescript
// In lib/markdown.ts
function slugify(basename: string): string {
  const trimmed = basename.trim();
  if (trimmed === "") return "untitled";
  return trimmed.replace(/\s+/g, "-");
}
```

### 4. Verify GREEN — watch it pass

```bash
npm run test:lib
```

Confirm:
- New assertion passes
- **All other assertions still pass** (no regressions)
- Output is clean (no warnings, no thrown errors logged)

If other tests fail, fix now. Do not move on.

### 5. REFACTOR — only after green

Clean up. Rename. Extract helpers. Tests must stay green throughout.

Don't add new behavior in this step.

## Bug fixes are TDD too

A bug = current behavior ≠ expected behavior. The test that captures the expected behavior is the regression test.

Flow:
1. Reproduce the bug as a failing test (RED).
2. Verify it fails for the right reason.
3. Fix the production code (GREEN).
4. Verify the fix passes AND the test would have failed before the fix (revert the fix locally, watch it fail, restore).

Step 4 is the part most agents skip. Don't.

## "Hard to test" = "hard to use"

If you can't write a test, the design is wrong. Options, in order of preference:

1. **Refactor for testability.** Pull pure logic out of the React component / Next.js route into `lib/`. Test the pure piece.
2. **Inject the dependency.** If the function reads `process.cwd()` or the filesystem, take that as a parameter so the test can pass a temp dir.
3. **Write an integration assertion** in the smoke test that hits the real path with a fixture in a temp dir.
4. **Ask the user.** If it's truly untestable (e.g. visual rendering of a drop cap), say so explicitly and propose a manual verification ritual instead.

What you do **not** do: skip the test and ship.

## Red Flags — STOP

These thoughts mean: delete what you wrote, start over.

| Excuse | Reality |
|---|---|
| "Too simple to test" | Simple code breaks. The user has the receipts. |
| "I'll write the test after" | You won't. And after, you'll test what you built — not what's required. |
| "I already verified in `npm run dev`" | Manual ≠ repeatable. The next agent can't re-run your eyes. |
| "TypeScript will catch it" | `tsc` checks shapes, not behavior. The empty-string slug bug type-checks fine. |
| "Library has its own tests" | The library doesn't know about your assumptions. Test the integration. |
| "There's no good way to test this" | Then the design is wrong. Refactor first. |
| "The bug is obvious, the fix is obvious" | Then the regression test is also obvious. Write it. |
| "I'll add a test as part of the next PR" | The next PR won't happen. Or it will, and you'll have forgotten what to test. |
| "This is a CSS-only change" | Does it change rendered HTML, classnames, `data-*` attrs, or `<a href>`? Then test. |

## Verification checklist

Before you say "done":

- [ ] Every new function / changed behavior has a smoke-test assertion
- [ ] You watched each new assertion fail before implementing
- [ ] Each assertion failed for the expected reason (not typo, not unrelated error)
- [ ] You wrote the smallest code that passes
- [ ] `npm run test:lib` exits 0 with `N passed, 0 failed`
- [ ] `npm run typecheck` exits 0
- [ ] If you touched rendering: spot-checked output in `npm run dev` for at least one note
- [ ] Output of all the above is in this conversation, not "I ran it earlier"

If you can't tick every box: you skipped TDD. Roll back and start over.

## When stuck

| Problem | First move |
|---|---|
| Don't know what to assert | Write the wished-for assertion. The shape of the API falls out of it. |
| Test needs the whole Vault to set up | Pull the unit out of the function. Test the unit on a fixture. |
| Test passes immediately | You're testing existing behavior. Pick a behavior that doesn't exist yet. |
| Smoke test is becoming a mess | Add a section header. Or split into a sibling `scripts/<area>-test.mjs`. Ask the user before adding a new framework. |
| You wrote 200 lines and now realize you should have tested first | Delete them. Start over. Sunk cost is not a reason to keep untested code. |

## The bottom line

```
Production code change → test exists and failed first
Otherwise → not TDD, not done, roll back
```

The user does not want a fast wrong answer. They want a slow right answer.
