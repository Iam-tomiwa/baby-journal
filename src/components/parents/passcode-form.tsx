"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { unlock } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Field, FormError, inputClass, primaryButton } from "./fields";

export function PasscodeForm() {
  const [state, action, pending] = useActionState(unlock, null);
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="grid max-w-sm gap-6">
      <Field
        id="passcode"
        label="Parent passcode"
        hint="Reading the journals never needs this. Adding to them does."
      >
        <div className="relative">
          <Input
            id="passcode"
            name="passcode"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={state ? !state.ok : undefined}
            className={cn(inputClass, "pr-13")}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide passcode" : "Show passcode"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-xl text-ink-soft transition-colors duration-150 hover:text-ink"
          >
            {visible ? (
              <EyeOff
                aria-hidden="true"
                className="size-5"
                strokeWidth={2.25}
              />
            ) : (
              <Eye aria-hidden="true" className="size-5" strokeWidth={2.25} />
            )}
          </button>
        </div>
      </Field>
      <FormError message={state && !state.ok ? state.message : null} />
      <div>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Checking…" : "Open the desk"}
        </button>
      </div>
    </form>
  );
}
