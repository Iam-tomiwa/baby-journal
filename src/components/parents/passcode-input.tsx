"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { inputClass } from "./fields";

/** A passcode field with an eye button to show or hide what was typed. */
export function PasscodeInput({
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn(inputClass, "pr-13", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide passcode" : "Show passcode"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-xl text-ink-soft transition-colors duration-150 hover:text-ink"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-5" strokeWidth={2.25} />
        ) : (
          <Eye aria-hidden="true" className="size-5" strokeWidth={2.25} />
        )}
      </button>
    </div>
  );
}
