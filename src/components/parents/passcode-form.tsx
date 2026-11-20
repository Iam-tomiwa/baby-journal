"use client";

import { useActionState } from "react";
import { unlock } from "@/app/actions";
import { Field, FormError, primaryButton } from "./fields";
import { PasscodeInput } from "./passcode-input";

export function PasscodeForm() {
  const [state, action, pending] = useActionState(unlock, null);

  return (
    <form action={action} className="grid max-w-sm gap-6">
      <Field
        id="passcode"
        label="Parent passcode"
        hint="Reading the journals never needs this. Adding to them does."
      >
        <PasscodeInput
          id="passcode"
          name="passcode"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state ? !state.ok : undefined}
        />
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
