import { buildSearchIndex } from "@/lib/search";
import SearchClient from "./SearchClient";

export const metadata = { title: "Search — Sanctuary" };

export default function SearchPage() {
  const index = buildSearchIndex();
  return (
    <div className="space-y-6 px-6 py-8 pb-28 lg:px-10 lg:pb-8">
      <h1 className="font-sans text-display text-[var(--text)]">Search</h1>
      <SearchClient index={index} />
    </div>
  );
}
