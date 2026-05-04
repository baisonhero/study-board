import {
  getHomeNote,
  getNotesByCategory,
  renderMarkdown,
} from "@/lib/markdown";
import NoteList from "@/components/NoteList";

export default async function HomePage() {
  const home = getHomeNote();
  const notes = getNotesByCategory("note");
  const daily = getNotesByCategory("daily").slice().reverse();
  const weekly = getNotesByCategory("weekly").slice().reverse();

  const homeHtml = home ? await renderMarkdown(home.body) : null;

  return (
    <div className="space-y-10">
      {home && homeHtml ? (
        <section>
          <h1 className="mb-4 text-2xl font-bold">{home.title}</h1>
          <article
            className="prose"
            dangerouslySetInnerHTML={{ __html: homeHtml }}
          />
        </section>
      ) : (
        <section>
          <h1 className="mb-2 text-2xl font-bold">Vault Viewer</h1>
          <p className="text-[var(--subtext)]">
            MOC Home が見つかりませんでした。下のセクションからノートを開いてください。
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">ノート ({notes.length})</h2>
        <NoteList
          notes={notes
            .filter((n) => n.slug !== home?.slug)
            .sort((a, b) => a.title.localeCompare(b.title))}
        />
      </section>

      {daily.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            デイリーログ ({daily.length})
          </h2>
          <NoteList notes={daily} />
        </section>
      )}

      {weekly.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            週次レビュー ({weekly.length})
          </h2>
          <NoteList notes={weekly} />
        </section>
      )}
    </div>
  );
}
