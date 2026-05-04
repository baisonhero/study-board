import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-2xl font-bold">見つかりませんでした</h1>
      <p className="text-[var(--subtext)]">
        指定されたノートまたはページは存在しません。
      </p>
      <p>
        <Link href="/" className="text-[var(--link)]">
          ホームへ戻る
        </Link>
      </p>
    </div>
  );
}
