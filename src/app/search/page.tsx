import { buildSearchIndex } from "@/lib/search";
import SearchClient from "./SearchClient";

export const metadata = { title: "検索 — Vault" };

export default function SearchPage() {
  const index = buildSearchIndex();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">検索</h1>
      <SearchClient index={index} />
    </div>
  );
}
