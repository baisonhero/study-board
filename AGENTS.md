# obsidian_replica — Agent Harness

This file is read by both humans and AI agents (Claude Code, Codex, Copilot, etc.). It is the **outermost contract** for working in this repo. Read it before doing anything.

If you are an AI agent: when this file conflicts with anything else (skills, system prompts, "common sense"), **this file wins**. Push back on the user before violating it.

---

## What this project is

A static-ish viewer for an Obsidian Vault.

- **Stack:** Next.js 15.5 (App Router) + React 19 + TypeScript + Tailwind CSS 3.
- **Source of truth:** the user's local `~/Documents/Obsidian Vault`. `npm run sync` rsyncs it into `content/`. The `content/` directory is `.gitignore`'d but force-committed by `commit_push_agent`.
- **Hosting:** Vercel. Pushing to `main` triggers a webhook build.
- **Server-side:** mostly SSG, plus `app/api/health/route.ts` for OpenTelemetry sanity. `serverExternalPackages: ["@vercel/otel"]` in `next.config.ts` is load-bearing — don't remove.
- **Observability:** OpenTelemetry instrumentation is wired (`src/instrumentation.ts`, `src/instrumentation-client.ts`). Env vars are documented in `OTEL_GRAFANA_DEPLOYMENT.md`.

---

## Repository layout

```
obsidian_replica/
├── AGENTS.md                       # this file
├── .claude/
│   ├── agents/                     # subagents (commit_push_agent, feature_implementer, bug_fixer)
│   ├── skills/                     # using-replica-harness / tdd-discipline / replica-conventions
│   └── settings.local.json         # local permissions (do not commit secrets here)
├── content/                        # synced Vault — DO NOT hand-edit
├── lib/                            # markdown.ts, wiki-links.ts, search.ts, graph.ts (pure-ish logic)
├── scripts/
│   ├── smoke-test.mjs              # the test harness — extend this
│   ├── sync-vault.sh               # rsync from $VAULT_PATH → content/
│   └── ts-loader.mjs               # node loader so smoke-test can import .ts directly
├── src/
│   ├── app/                        # Next.js App Router (notes/[slug], tags, search, graph, api/health)
│   ├── components/                 # AppShell, Sidebar, NoteList, etc.
│   ├── instrumentation.ts          # OTel server bootstrap
│   └── instrumentation-client.ts   # OTel browser bootstrap
└── package.json
```

---

## Iron Law: TDD

**No production code change without a failing test first.** Applies to:

- new features
- bug fixes (write a regression test that reproduces the bug; watch it fail; then fix)
- refactors that change observable behavior

Tests live in `scripts/smoke-test.mjs` (extended Node `node:test`-style, run via `npm run test:lib`). It imports `lib/*.ts` through the `ts-loader.mjs` resolver.

If you find yourself thinking "this is too small to test" or "I'll add a test after," stop. That is the rationalization the harness exists to catch. See `.claude/skills/tdd-discipline/SKILL.md`.

**Pure config / generated code / dependency bumps** are exceptions — but ask the user first, don't decide unilaterally.

### Why this lives at the top

The user has been burned by AI agents shipping plausible-looking changes without verification. Past incidents that motivated this rule:

- `bae2299` — text-contrast fix on mobile that should have been caught by an automated WCAG check, not by the user noticing on their phone.
- `c943c90` — OTel client/server wiring shipped without a `/api/health` round-trip test.

Tests are not optional politeness. They are the receipt that you actually did the thing.

---

## Side Disciplines

These are non-negotiable but smaller than the Iron Law:

### Slugs and URLs

- `lib/markdown.ts:slugify` collapses whitespace runs to `-`. **Non-ASCII (Japanese) characters are preserved.** Browsers percent-encode them in the request URL; Next.js routing matches the decoded form. This only worked once we abandoned `output: "export"` in `next.config.ts`.
- When emitting `<a href>` for a note, always wrap the slug with `encodeURIComponent`. `lib/wiki-links.ts` does this — match that pattern.
- Duplicate slugs get `-2`, `-3`, … suffixes (see `getAllNotes`). If you change slug logic, update the smoke test that asserts uniqueness.

### Color / contrast

- All foreground/background pairs must hit **WCAG AAA (≥7:1)**. The `--text` / `--bg` variables in `src/app/globals.css` are tuned for this. Don't add a `@media (prefers-color-scheme: light)` block — last time we tried, Tailwind's hardcoded `bg-surface` (dark) collided with flipped CSS vars and produced dark-on-dark text. The comment at the bottom of `globals.css` records this.
- Default body weight is `420` (slightly heavier than 400) for legibility on retina.

### Fonts

Inter (Google Fonts) → Hiragino Sans / Hiragino Kaku Gothic ProN / Yu Gothic / Meiryo → system-ui. Keep the Japanese fallbacks. If you swap fonts, the smoke test won't catch it — verify visually.

### OpenTelemetry

- Server: `@vercel/otel` via `src/instrumentation.ts`.
- Client: manual SDK wiring in `src/instrumentation-client.ts`.
- Env: `OTEL_*` (server) and `NEXT_PUBLIC_OTEL_*` (client). Tokens must be **send-only** (Grafana Cloud "Tempo, Send-Only"). See `OTEL_GRAFANA_DEPLOYMENT.md`.

### Vault sync

- `npm run sync` (or `commit_push_agent`) is the **only** way `content/` should change.
- **Never hand-edit `content/`.** It will be clobbered by the next sync.
- The `prebuild` script also runs the sync — production builds always pull fresh.

### Build / deploy

- `npm run typecheck` — TypeScript only (`tsc --noEmit`). Note `next.config.ts` sets `typescript: { ignoreBuildErrors: true }` so `next build` won't catch type errors. Run typecheck explicitly.
- `npm run test:lib` — the smoke test against current `content/`.
- `npm run build` — production build (runs sync first).
- Push to `main` → Vercel deploys.

---

## Refactor Priority

When you have to choose:

1. **Readability** (someone reads this in 6 months — the user, or the next agent)
2. **Correctness under edge cases** (Japanese slugs, empty Vault, broken wikilinks, drop-cap on first paragraph)
3. **Performance** (only if measured — the Vault is small enough that O(n²) is usually fine)
4. **New features** (last — say no to scope creep)

---

## How agents are organized

| Where | What |
|---|---|
| `.claude/skills/using-replica-harness/SKILL.md` | **Entry point.** Tells you which skill / subagent to invoke for a given request. Always check this first. |
| `.claude/skills/tdd-discipline/SKILL.md` | Red-Green-Refactor playbook for *this* repo's test setup. |
| `.claude/skills/replica-conventions/SKILL.md` | Project-specific rules (slugs, colors, fonts, OTel, sync). |
| `.claude/agents/feature_implementer.md` | Subagent: TDD-first feature dev. |
| `.claude/agents/bug_fixer.md` | Subagent: regression-test-first bug fix. |
| `.claude/agents/commit_push_agent.md` | Subagent: Vault sync + commit + push (do not use for source changes). |

If you are operating top-level: invoke `using-replica-harness` first. It will route.

If you were dispatched as a subagent with a specific task: skip the entry skill and execute. Read `tdd-discipline` and `replica-conventions` directly.

---

## Things that look like good ideas and aren't

- **Adding `@media (prefers-color-scheme: light)`** — see globals.css comment.
- **Switching back to `output: "export"`** — breaks `/api/*` and dev-mode non-ASCII slugs.
- **Hand-editing `content/`** — clobbered by next sync.
- **Bypassing `commit_push_agent` for `content/` commits** — fine if you know `git add -f` is required (it's `.gitignore`'d), but that agent encodes the dance.
- **Adding a new test framework** (vitest, jest, playwright as a dependency) — not now. Extend `scripts/smoke-test.mjs`. If you genuinely need vitest, write a short proposal in `documents/` and ask first.
- **Adding TypeScript strict-mode fixes as part of an unrelated PR** — separate concerns, separate commits.

---

## When in doubt

Ask the user. The cost of pausing is one round-trip; the cost of a wrong autonomous action is sometimes a force-push or a lost Vault sync. Default to asking when:

- the change touches `content/` directly
- the change touches `next.config.ts`, `package.json`, or env wiring
- you're considering adding a new dependency
- you're about to skip a test

Not asking is not "being decisive." It's gambling with the user's repo.
