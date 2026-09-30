import { connection } from "next/server";
import { listEntries } from "@/lib/entries";
import { EntryForm } from "./entry-form";
import { EntryItem } from "./entry-item";

function formatCreatedAt(date: Date) {
  return date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

export default async function Home() {
  // 요청마다 DB를 새로 읽는다 (빌드 시점에 정적으로 굳지 않게)
  await connection();
  const entries = await listEntries();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <header className="mb-8 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h1 className="text-2xl font-bold">방명록</h1>
        <p className="mt-1 text-sm text-zinc-500">
          개발자: 정윤서 (202404307)
        </p>
      </header>

      <EntryForm />

      <section>
        {entries.length === 0 ? (
          <p className="py-10 text-center text-zinc-500">
            아직 방명록 글이 없습니다. 첫 글을 남겨 주세요!
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {entries.map((entry) => (
              <EntryItem
                key={entry.id}
                id={entry.id}
                name={entry.name}
                message={entry.message}
                createdAtIso={entry.createdAt.toISOString()}
                createdAtText={formatCreatedAt(entry.createdAt)}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
