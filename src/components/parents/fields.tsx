"use client";

import { createContext, use, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import type { Child } from "@/lib/types";
import { cn } from "@/lib/utils";

export const inputClass =
  "h-12 rounded-xl border-input bg-paper px-3.5 text-base md:text-base";
export const textareaClass =
  "min-h-28 rounded-xl border-input bg-paper px-3.5 py-3 text-base md:text-base";

export const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-7 text-base font-semibold text-paper transition-transform duration-150 ease-out-expo hover:scale-[1.03] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-sm text-ink-soft">{hint}</p> : null}
    </div>
  );
}

/** Which child's journal an entry goes into. */
export function ChildPicker({
  options,
  value,
  onChange,
  legend = "Whose journal?",
}: {
  options: Child[];
  value: string;
  onChange: (id: string) => void;
  legend?: string;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((child) => (
          <label
            key={child.id}
            data-cover={child.coverColor}
            className="cursor-pointer"
          >
            <input
              type="radio"
              name="childId"
              value={child.id}
              checked={value === child.id}
              onChange={() => onChange(child.id)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink px-4 text-base font-semibold text-ink transition-colors duration-150 peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cobalt">
              <span
                aria-hidden="true"
                className="size-3.5 rounded-full bg-cover ring-2 ring-paper"
              />
              {child.name}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** The message a form shows under its button when the server says no. */
export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
    >
      {message}
    </p>
  );
}

const PreviewContext = createContext<{
  sheet: string;
  preview: ReactNode;
} | null>(null);

const previewSheet =
  "sheet flex items-center justify-center rounded-3xl p-8 sm:p-10";

/**
 * Fields on the left, the entry as it will look in the journal on the right.
 * On phones and tablets the preview moves to just above the submit button
 * (see FormFooter), so it is on screen at the moment of adding.
 */
export function FormLayout({
  sheet,
  preview,
  children,
}: {
  sheet: string;
  preview: ReactNode;
  children: ReactNode;
}) {
  return (
    <PreviewContext value={{ sheet, preview }}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
        <div className="grid content-start gap-6">{children}</div>
        <aside
          data-sheet={sheet}
          aria-label="How it will look in the journal"
          className={cn(
            previewSheet,
            "hidden min-h-[26rem] lg:sticky lg:top-6 lg:flex lg:self-start",
          )}
        >
          {preview}
        </aside>
      </div>
    </PreviewContext>
  );
}

/** The end of a form: the small-screen preview, any error, then the submit button. */
export function FormFooter({ children }: { children: ReactNode }) {
  const context = use(PreviewContext);
  return (
    <>
      {context ? (
        <div
          data-sheet={context.sheet}
          role="group"
          aria-label="How it will look in the journal"
          className={cn(previewSheet, "min-h-56 lg:hidden")}
        >
          {context.preview}
        </div>
      ) : null}
      {children}
    </>
  );
}
