"use server";

import { revalidatePath } from "next/cache";
import {
  createEntry,
  deleteEntry,
  updateMessage,
  type GuardedResult,
} from "@/lib/entries";

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

const GUARD_ERRORS: Record<Exclude<GuardedResult, "ok">, string> = {
  "wrong-password": "비밀번호가 일치하지 않습니다.",
  "not-found": "이미 삭제된 글입니다.",
};

export type UpdateMessageState = {
  ok?: boolean;
  error?: string;
  values?: { message: string };
};

export async function updateMessageAction(
  _prev: UpdateMessageState,
  formData: FormData,
): Promise<UpdateMessageState> {
  const id = Number(formData.get("id"));
  const message = field(formData, "message");
  const password = field(formData, "password");
  const values = { message };

  if (!Number.isInteger(id)) {
    return { error: GUARD_ERRORS["not-found"], values };
  }
  if (!message || !password) {
    const missing = [!message && "메시지", !password && "비밀번호"].filter(Boolean);
    return { error: `${missing.join(", ")}을(를) 입력해 주세요.`, values };
  }
  if (message.length > 500) {
    return { error: "메시지는 500자까지 입력할 수 있습니다.", values };
  }

  let result: GuardedResult;
  try {
    result = await updateMessage({ id, message, password });
  } catch {
    return { error: "수정하지 못했습니다. 잠시 후 다시 시도해 주세요.", values };
  }
  if (result !== "ok") {
    return { error: GUARD_ERRORS[result], values };
  }

  revalidatePath("/");
  return { ok: true };
}

export type DeleteEntryState = {
  ok?: boolean;
  error?: string;
};

export async function deleteEntryAction(
  _prev: DeleteEntryState,
  formData: FormData,
): Promise<DeleteEntryState> {
  const id = Number(formData.get("id"));
  const password = field(formData, "password");

  if (!Number.isInteger(id)) {
    return { error: GUARD_ERRORS["not-found"] };
  }
  if (!password) {
    return { error: "비밀번호를 입력해 주세요." };
  }

  let result: GuardedResult;
  try {
    result = await deleteEntry({ id, password });
  } catch {
    return { error: "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (result !== "ok") {
    return { error: GUARD_ERRORS[result] };
  }

  revalidatePath("/");
  return { ok: true };
}
