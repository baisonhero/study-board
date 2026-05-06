# Hook Proposals (TDD Support) — Not Activated

These are hook ideas for `.claude/settings.json` that would mechanically reinforce the TDD discipline documented in `AGENTS.md` and `.claude/skills/tdd-discipline/`.

**Status:** Documented, not enforced. The harness is currently prose-and-discipline only, on purpose — we want to feel out which hooks pull their weight before activating any. Activating prematurely tends to produce false positives that train agents to ignore the warning.

If/when we activate one, we move it from this file into `.claude/settings.json` under `hooks`.

## 1. PreToolUse warning when editing `lib/**` without a matching test edit

**Trigger:** `PreToolUse` on `Edit` / `Write` to `lib/**/*.ts`.

**Check:** has `scripts/smoke-test.mjs` (or any sibling `scripts/*-test.mjs`) been touched in the current session? (Approximate via `git diff HEAD scripts/` or a session-state file.)

**Behavior:** print a non-blocking warning: "About to edit `lib/`; no test changes staged this session — TDD reminder."

**Sketch:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "bash -c 'case \"$CLAUDE_TOOL_INPUT_FILE_PATH\" in *lib/*) [ -z \"$(git diff HEAD scripts/)\" ] && echo \"[harness] TDD reminder: editing lib/ without staged test changes\" >&2 ;; esac; exit 0'"
      }
    ]
  }
}
```

**Why not yet:** `git diff HEAD` is a coarse signal — refactors that don't need new tests would warn. False positives erode trust in the warning.

## 2. PreToolUse warning when editing a `.tsx` component without a co-located test

**Trigger:** `PreToolUse` on `Edit` / `Write` to `src/components/**/*.tsx`.

**Check:** does a sibling `*.test.*` exist? (For now, none do — we'd have to set up component tests first.)

**Behavior:** warn the agent that no component test exists, suggesting either adding one or pulling pure logic into `lib/` for unit testing.

**Why not yet:** we don't have a component test setup. Activating this hook before the testing path exists would just spam warnings with no actionable resolution.

## 3. PostToolUse: auto-run `npm run test:lib` when smoke-test.mjs changes

**Trigger:** `PostToolUse` on `Edit` / `Write` to `scripts/smoke-test.mjs`.

**Behavior:** run `npm run test:lib` and surface result.

**Why not yet:** smoke test currently takes a few seconds and depends on `content/` being synced. Auto-running on every save would slow editing. Better as a manual ritual until we have either (a) faster tests or (b) a cached "last sync" check.

## 4. Stop hook: refuse to commit without a successful `npm run test:lib`

**Trigger:** `PreToolUse` on `Bash` calls matching `git commit`.

**Behavior:** run `npm run test:lib`; if it fails, block the commit.

**Why not yet:** commits sometimes happen for content sync (`commit_push_agent`) where `test:lib` is irrelevant. Need a way to scope this to source-code commits only — perhaps via path matchers on staged files.

## 5. UserPromptSubmit: surface the harness on first message of a session

**Trigger:** `UserPromptSubmit` (first one in session).

**Behavior:** inject a reminder pointing at `AGENTS.md` and `using-replica-harness` skill.

**Why not yet:** redundant with `AGENTS.md` being auto-loaded by Claude Code at session start. If we move to a harness that doesn't auto-load AGENTS.md, revisit.

## Activation criteria

Before promoting any of these from this file into `settings.json`:

1. The hook has been mentally simulated against the last 3–5 sessions of work — would it have fired correctly?
2. The false-positive rate would be < ~10%.
3. The user has confirmed they want it on.
4. The hook itself has a unit-level smoke check (a synthetic input that triggers it).

Until those are met, harness behavior comes from prose discipline (`AGENTS.md` + skills) only.
