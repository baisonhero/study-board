---
name: replica-conventions
description: Use whenever editing obsidian_replica source - documents project-specific rules for slugs, colors, fonts, OTel, build/deploy, and Vault sync that are not derivable from reading the code alone
---

# obsidian_replica Conventions

These are the rules that aren't obvious from reading the code, plus the ones that *are* obvious but get violated anyway because they look "wrong" to an agent that doesn't know the history.

## File structure

```
lib/                   # pure-ish logic, importable from both Next.js and the smoke test
  markdown.ts          # Note model, walk(), slugify, render, backlinks, link index
  wiki-links.ts        # [[Wikilink]] → markdown link / broken-link span
  search.ts            # buildSearchIndex (shipped to the client)
  graph.ts             # graph view data

src/app/               # Next.js App Router
  layout.tsx           # Loads all notes + tags into AppShell at request time
  page.tsx             # Home (MOC Home / MOC / Home / index, in that order)
  notes/[slug]/page.tsx
  tags/                # /tags and /tags/[tag]
  search/              # client-side search UI
  graph/               # graph view
  api/health/route.ts  # OTel sanity probe — keep this alive

src/components/        # AppShell, Sidebar, Header, NoteList, NoteCard, RightPanel, BottomNav, TagBadge
src/instrumentation.ts         # @vercel/otel server bootstrap
src/instrumentation-client.ts  # OpenTelemetry browser SDK bootstrap

scripts/
  smoke-test.mjs       # the test harness — extend this
  sync-vault.sh        # rsync $VAULT_PATH → content/
  ts-loader.mjs        # node loader so smoke test can import .ts
```

**Pure logic goes in `lib/`. React/Next.js stuff goes in `src/`.** This split exists so the smoke test can exercise logic without booting Next.js. If you find yourself wanting to test something inside `src/components/`, pull the pure part out into `lib/` first.

## Slugs and links

`lib/markdown.ts:slugify`:

```typescript
function slugify(basename: string): string {
  return basename.trim().replace(/\s+/g, "-");
}
```

Rules:

- Whitespace runs collapse to single `-`.
- **Non-ASCII (Japanese, etc.) is preserved as-is.** Browsers percent-encode these in URLs; Next.js routing matches the decoded form. This works *because* `next.config.ts` no longer uses `output: "export"`.
- Duplicate slugs from different files get `-2`, `-3` suffixes (counted in `getAllNotes`).
- The smoke test asserts uniqueness — if you change slug logic, run `npm run test:lib`.

When emitting an `<a href>` in TypeScript, **always** wrap with `encodeURIComponent`:

```typescript
const url = `/notes/${encodeURIComponent(slug)}/`;
```

`lib/wiki-links.ts:transformWikiLinks` does this. Match that pattern. The smoke test has a section that checks Japanese-slug wikilinks render as URL-encoded hrefs — don't break it.

## Wikilink syntax supported

```
[[Note Name]]
[[Note Name|Display]]
[[Note Name#Heading]]
[[Note Name#Heading|Display]]
```

If the target doesn't resolve, render a `<span class="broken-link">`. The CSS for that class is in `globals.css`.

## Color tokens

Defined in `src/app/globals.css` `:root`. All foreground/background combos must hit **WCAG AAA (≥7:1 for body, ≥4.5:1 for large text)**.

The current palette (dark only):

| Token | Use |
|---|---|
| `--bg`, `--bg-low`, `--bg-container`, `--bg-high`, `--bg-highest`, `--bg-bright` | Background scale, low → high elevation |
| `--text` | Body text (`#f5f8fa` on `--bg #10181c` → 14.6:1) |
| `--text-variant`, `--subtext` | Secondary text |
| `--primary` (mint), `--secondary` (amber), `--tertiary` (blue) | Accents |
| `--link` | Links — same hue as `--tertiary` for affordance |
| `--outline`, `--outline-variant`, `--border`, `--muted` | Dividers and disabled |
| `--glass-bg`, `--glass-border`, `--glass-blur` | Glassmorphism utility |

**No light mode.** A `@media (prefers-color-scheme: light)` block was removed because Tailwind's hardcoded `bg-surface` (dark) collided with flipped CSS vars and caused dark-on-dark text. The comment at the bottom of `globals.css` records this. If you need a light theme, it's a much bigger project than flipping a media query — ask the user.

## Fonts

```css
"Inter", -apple-system, BlinkMacSystemFont,
"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo,
system-ui, sans-serif;
```

Loaded from Google Fonts via `@import` at the top of `globals.css`. Body weight is `420` (between Regular and Medium) for retina legibility — the user picked this deliberately, don't reset to `400`.

`Newsreader` is loaded for the drop-cap on the first paragraph (`.prose-dropcap > p:first-of-type::first-letter`).

## Markdown rendering

`renderMarkdown` in `lib/markdown.ts` runs:

```
remark-parse → remark-gfm → remark-rehype (allowDangerousHtml) → rehype-raw
  → rehype-slug → rehype-highlight → rehype-stringify
```

Wikilinks are pre-transformed in `lib/wiki-links.ts` *before* the remark/rehype pipeline runs. They become standard markdown links so remark-gfm parses them normally.

`allowDangerousHtml` is required because Vault notes contain raw HTML. `rehype-raw` re-parses it. The smoke test renders 20 sample notes and asserts no exceptions — if you change the pipeline, run it.

## Frontmatter conventions

Read by `gray-matter`. Recognized keys:

- `title` (string) — overrides the basename in the rendered title; basename used as fallback
- `tags` (array or comma/space-separated string, `#` prefix optional)
- `created` (string, formatted however the Vault uses)

Anything else is preserved on `note.frontmatter` for future use.

## OpenTelemetry

Two bootstraps:

- **Server:** `src/instrumentation.ts` uses `@vercel/otel`. Listed in `serverExternalPackages` in `next.config.ts` because its transitive deps are Node-only.
- **Client:** `src/instrumentation-client.ts` wires `@opentelemetry/sdk-trace-web` with `document-load`, `fetch`, `user-interaction` instrumentations.

Env vars (see `OTEL_GRAFANA_DEPLOYMENT.md`):

| Var | Where | Notes |
|---|---|---|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | server | Grafana Cloud Tempo OTLP endpoint |
| `OTEL_EXPORTER_OTLP_HEADERS` | server | `Authorization=Basic <send-only-token>` |
| `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT` | client | Same endpoint, must be `NEXT_PUBLIC_*` to reach the browser |
| `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_HEADERS` | client | Send-only token only — never write-tokens here |

**The Grafana token MUST be send-only.** A write-token in client-side env leaks publicly. The user has been bitten by this in another project; do not be the agent that does it again.

`/api/health` exists as a span sanity probe. Don't delete it.

## Build, test, deploy

Scripts in `package.json`:

| Command | What |
|---|---|
| `npm run sync` | rsync Vault → `content/`. Configurable via `VAULT_PATH` env. |
| `npm run dev` | Next.js dev server (port 3000 default). Sometimes user runs on 3010. |
| `npm run build` | Runs `prebuild` (= sync) then `next build`. |
| `npm run start` | Production server, after build. |
| `npm run typecheck` | `tsc --noEmit`. **Run this — `next build` skips type errors** (`typescript: { ignoreBuildErrors: true }`). |
| `npm run test:lib` | The smoke test against current `content/`. |

Verification ritual before claiming "done":

```bash
npm run test:lib && npm run typecheck
```

For changes that touch the build (next.config.ts, dependencies, Tailwind config), also run:

```bash
npm run build
```

Push to `main` triggers Vercel auto-deploy. The user generally pushes themselves; don't push without asking.

## Vault sync flow

1. User edits notes in Obsidian → saved to `~/Documents/Obsidian Vault` (configurable via `VAULT_PATH`).
2. `npm run sync` (or `commit_push_agent`) rsyncs into `content/` with these excludes: `_templates`, `_attachments`, `raw`, `.obsidian`, `.git`, `.claude`, `.trash`, `.gitignore`, `.DS_Store`.
3. `content/` is `.gitignore`'d. `commit_push_agent` uses `git add -f content/` to force-stage it.
4. Commit message: `chore(content): sync vault YYYY-MM-DD`.
5. `git push origin main` → Vercel webhook builds and deploys.

**Never hand-edit `content/`.** The next sync clobbers it. If you need to test rendering, edit a note in the Vault itself and run `npm run sync`, or build a fixture in a temp dir.

## Things that would seem like improvements but aren't

| Tempting change | Why not |
|---|---|
| Add `output: "export"` back | Breaks `/api/*` and dev-mode non-ASCII slugs. |
| Add light mode via `@media` | Collided with Tailwind's `bg-surface` last time → dark-on-dark. Bigger project than it looks. |
| Reset body weight to 400 | User picked 420 deliberately for retina. |
| Drop the Japanese fallback fonts | Breaks rendering for half the Vault. |
| Move `slugify` to use `slugify` npm package | Loses Japanese preservation. |
| Replace smoke test with vitest | Discuss first. The current setup boots in <1s and has no devDeps to manage. |
| Remove `serverExternalPackages: ["@vercel/otel"]` | Breaks edge runtime build. |
| Hand-edit `content/` to fix a typo | Will be wiped on next sync. Edit the Vault. |
| `git add content/` without `-f` | Silent no-op, `.gitignore` excludes it. Use `commit_push_agent` or `git add -f`. |

## When you must add a new dependency

1. Stop. Ask the user.
2. If approved: add in its own commit. No bundling with feature work.
3. Run `npm run test:lib && npm run typecheck && npm run build` before pushing.
4. Document the rationale in the commit body, not just the title.

## When you must change `next.config.ts`

Same as above. The current config has comments explaining why each setting exists — read them before editing. If you remove a setting whose comment cites a past bug, the bug returns.
