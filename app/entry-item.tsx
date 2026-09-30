"use client";

import { useActionState, useState } from "react";
import {
  deleteEntryAction,
  updateMessageAction,
  type DeleteEntryState,
  type UpdateMessageState,
} from "./actions";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700";
const smallButton =
  "rounded-md border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-700 disabled:opacity-50";

type Props = {
  id: number;
  name: string;
  message: string;
  createdAtIso: string;
  createdAtText: string;
};

type Mode = "view" | "edit" | "delete";

export function EntryItem(props: Props) {
  const [mode, setMode] = useState<Mode>("view");

  return (
    <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{props.name}</span>
        <time dateTime={props.createdAtIso} className="text-xs text-zinc-500">
          {props.createdAtText}
        </time>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words">{props.message}</p>

      {mode === "view" && (
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" className={smallButton} onClick={() => setMode("edit")}>
            수정
          </button>
          <button type="button" className={smallButton} onClick={() => setMode("delete")}>
            삭제
          </button>
        </div>
      )}

      {mode === "edit" && (
        <EditForm
          id={props.id}
          message={props.message}
          onDone={() => setMode("view")}
        />
      )}

      {mode === "delete" && (
        <DeleteForm id={props.id} onDone={() => setMode("view")} />
      )}
    </li>
  );
}

function EditForm(props: { id: number; message: string; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<UpdateMessageState, FormData>(
    async (prev, formData) => {
      const next = await updateMessageAction(prev, formData);
      if (next.ok) props.onDone();
      return next;
    },
    {},
  );

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="id" value={props.id} />
      <textarea
        name="message"
        maxLength={500}
        rows={3}
        defaultValue={state.values?.message ?? props.message}
        className={inputClass}
      />
      <input
        name="password"
        type="password"
        placeholder="글 비밀번호"
        className={inputClass}
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className={smallButton} onClick={props.onDone}>
          취소
        </button>
        <button type="submit" disabled={pending} className={smallButton}>
          {pending ? "수정 중..." : "수정 완료"}
        </button>
      </div>
    </form>
  );
}

function DeleteForm(props: { id: number; onDone: () => void }) {
  const [state, formAction, pending] = useActionState<DeleteEntryState, FormData>(
    async (prev, formData) => {
      const next = await deleteEntryAction(prev, formData);
      if (next.ok) props.onDone();
      return next;
    },
    {},
  );

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="id" value={props.id} />
      <p className="text-sm text-zinc-500">
        삭제하려면 글 비밀번호를 입력하세요.
      </p>
      <input
        name="password"
        type="password"
        placeholder="글 비밀번호"
        className={inputClass}
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button type="button" className={smallButton} onClick={props.onDone}>
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className={`${smallButton} border-red-400 text-red-600`}
        >
          {pending ? "삭제 중..." : "삭제하기"}
        </button>
      </div>
    </form>
  );
}
