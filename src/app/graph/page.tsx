import { buildGraphData } from "@/lib/graph";
import GraphClient from "./GraphClient";

export const metadata = { title: "Knowledge Graph — Sanctuary" };

export default function GraphPage() {
  const data = buildGraphData();
  return <GraphClient data={data} />;
}
