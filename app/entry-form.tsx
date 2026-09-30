"use client";

import { useActionState } from "react";
import { createEntryAction, type CreateEntryState } from "./actions";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";

export function EntryForm() {
  const [state, formAction, pending] = useActionState<CreateEntryState, FormData>(
    createEntryAction,
    {},
  );

  return (
    <form
      action={formAction}
      className="mb-8 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="name"
          placeholder="이름"
          maxLength={20}
          defaultValue={state.values?.name}
          className={inputClass}
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호 (수정·삭제용)"
          defaultValue={state.values?.password}
          className={inputClass}
        />
      </div>
      <textarea
        name="message"
        placeholder="메시지를 남겨 주세요"
        maxLength={500}
        rows={3}
        defaultValue={state.values?.message}
        className={inputClass}
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "등록 중..." : "남기기"}
      </button>
    </form>
  );
}
