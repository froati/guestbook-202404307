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
