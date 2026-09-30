import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);
const BCRYPT_COST = 10;

// 목록에 노출되는 방명록 글. 글 비밀번호(해시)는 절대 포함하지 않는다.
export type Entry = {
  id: number;
  name: string;
  message: string;
  createdAt: Date;
};

export async function listEntries(): Promise<Entry[]> {
  const rows = await sql`
    SELECT id, name, message, created_at
    FROM entries
    ORDER BY created_at DESC, id DESC
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: new Date(row.created_at),
  }));
}

export async function createEntry(input: {
  name: string;
  message: string;
  password: string;
}): Promise<void> {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  await sql`
    INSERT INTO entries (name, message, password_hash)
    VALUES (${input.name}, ${input.message}, ${passwordHash})
  `;
}

// 글 비밀번호가 필요한 작업(수정·삭제)의 결과
export type GuardedResult = "ok" | "wrong-password" | "not-found";

async function checkPassword(
  id: number,
  password: string,
): Promise<GuardedResult> {
  const rows = await sql`SELECT password_hash FROM entries WHERE id = ${id}`;
  if (rows.length === 0) return "not-found";
  const matches = await bcrypt.compare(password, rows[0].password_hash);
  return matches ? "ok" : "wrong-password";
}

export async function updateMessage(input: {
  id: number;
  message: string;
  password: string;
}): Promise<GuardedResult> {
  const check = await checkPassword(input.id, input.password);
  if (check !== "ok") return check;
  const rows = await sql`
    UPDATE entries SET message = ${input.message}
    WHERE id = ${input.id}
    RETURNING id
  `;
  return rows.length > 0 ? "ok" : "not-found";
}
