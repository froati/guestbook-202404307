"use server";

import { revalidatePath } from "next/cache";
import { createEntry } from "@/lib/entries";

export type CreateEntryState = {
  error?: string;
  // 실패 시 입력값을 되돌려 주어 폼이 비워지지 않게 한다
  values?: { name: string; message: string; password: string };
};

function field(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createEntryAction(
  _prev: CreateEntryState,
  formData: FormData,
): Promise<CreateEntryState> {
  const values = {
    name: field(formData, "name"),
    message: field(formData, "message"),
    password: field(formData, "password"),
  };

  const missing = [
    !values.name && "이름",
    !values.message && "메시지",
    !values.password && "비밀번호",
  ].filter(Boolean);
  if (missing.length > 0) {
    return { error: `${missing.join(", ")}을(를) 입력해 주세요.`, values };
  }
  if (values.name.length > 20 || values.message.length > 500) {
    return { error: "이름은 20자, 메시지는 500자까지 입력할 수 있습니다.", values };
  }

  try {
    await createEntry(values);
  } catch {
    return { error: "글을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.", values };
  }

  revalidatePath("/");
  return {};
}
