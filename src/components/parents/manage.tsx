"use client";

import { Trash2 } from "lucide-react";
import { useActionState, useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { changePasscode, deleteChild } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ActionState, Child } from "@/lib/types";
import { Field, FormError, inputClass, primaryButton } from "./fields";
import { PasscodeInput } from "./passcode-input";

const MIN_LENGTH = 6;

/** Replace the parent passcode. Fields are kept on a wrong attempt, cleared once it is changed. */
export function ChangePasscodeForm() {
  const id = useId();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const [state, action, pending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await changePasscode(prev, formData);
      if (result?.ok) {
        toast.success(result.message);
        setCurrent("");
        setNext("");
        setConfirm("");
      }
      return result;
    },
    null,
  );

  const tooShort = next.length > 0 && next.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== next;

  return (
    <form action={action} className="grid max-w-sm gap-5">
      <Field id={`${id}-current`} label="Current passcode">
        <PasscodeInput
          id={`${id}-current`}
          name="current"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          required
        />
      </Field>
      <Field
        id={`${id}-next`}
        label="New passcode"
        hint={
          tooShort
            ? `${MIN_LENGTH - next.length} more to go.`
            : `At least ${MIN_LENGTH} characters.`
        }
      >
        <PasscodeInput
          id={`${id}-next`}
          name="next"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          minLength={MIN_LENGTH}
          maxLength={100}
          required
          aria-invalid={tooShort}
        />
      </Field>
      <Field
        id={`${id}-confirm`}
        label="New passcode again"
        hint={mismatch ? "These two don't match yet." : undefined}
      >
        <PasscodeInput
          id={`${id}-confirm`}
          name="confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          aria-invalid={mismatch}
        />
      </Field>
      <FormError message={state && !state.ok ? state.message : null} />
      <div>
        <button
          type="submit"
          disabled={pending || tooShort || mismatch}
          className={primaryButton}
        >
          {pending ? "Changing…" : "Change passcode"}
        </button>
      </div>
    </form>
  );
}

/** Each journal with a way to delete it. Deleting asks for the child's name first. */
export function JournalManager({ journals }: { journals: Child[] }) {
  const inputId = useId();
  const [target, setTarget] = useState<Child | null>(null);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setTarget(null);
    setTyped("");
    setError(null);
  }

  const matches =
    target !== null &&
    typed.trim().toLowerCase() === target.name.trim().toLowerCase();

  function remove() {
    if (!target || !matches) return;
    const { id } = target;
    startTransition(async () => {
      const result = await deleteChild(id, typed);
      if (result?.ok) {
        toast.success(result.message);
        close();
      } else {
        setError(result?.message ?? "That couldn't be deleted. Try again.");
      }
    });
  }

  if (journals.length === 0) {
    return (
      <p className="text-base text-ink-soft">
        No journals yet. Start one from the &ldquo;New journal&rdquo; tab above.
      </p>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border border-y border-border">
        {journals.map((journal) => (
          <li
            key={journal.id}
            data-cover={journal.coverColor}
            className="flex items-center gap-4 py-3"
          >
            <span
              aria-hidden="true"
              className="size-9 shrink-0 rounded-l-[3px] rounded-r-md bg-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-ink">
                {journal.name}
              </p>
              <p className="truncate text-sm text-ink-soft">
                {journal.memoryCount === 1
                  ? "1 memory"
                  : `${journal.memoryCount} memories`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTarget(journal)}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold text-destructive transition-colors duration-150 hover:bg-destructive/10"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Delete journal
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={target !== null}
        onOpenChange={(open) => (open ? null : close())}
      >
        <DialogContent className="gap-5 rounded-2xl p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-ink">
              Delete {target?.name}&rsquo;s journal?
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-ink">
              {!target || target.memoryCount === 0
                ? "This deletes the journal and its mixtape."
                : `This deletes ${target.memoryCount === 1 ? "its 1 memory" : `all ${target.memoryCount} of its memories`}, every photo, video and recording stored for it, and its mixtape.`}{" "}
              It can&rsquo;t be undone.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              remove();
            }}
            className="grid gap-5"
          >
            <Field id={inputId} label={`Type ${target?.name ?? ""} to confirm`}>
              <Input
                id={inputId}
                value={typed}
                onChange={(e) => {
                  setTyped(e.target.value);
                  setError(null);
                }}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className={inputClass}
              />
            </Field>
            <FormError message={error} />
            <DialogFooter className="gap-3">
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink px-5 text-base font-semibold text-ink"
              >
                Keep the journal
              </button>
              <button
                type="submit"
                disabled={!matches || pending}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-destructive px-5 text-base font-semibold text-paper disabled:opacity-50"
              >
                {pending ? "Deleting…" : "Delete forever"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
