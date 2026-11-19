"use client";

import { RotateCw } from "lucide-react";
import { useEffect } from "react";
import { stateButton } from "@/components/state-page";

/** Reloads on request, and by itself the moment the connection comes back. */
export function Retry() {
  useEffect(() => {
    const reload = () => window.location.reload();
    window.addEventListener("online", reload);
    return () => window.removeEventListener("online", reload);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className={stateButton}
    >
      <RotateCw aria-hidden="true" className="size-4" strokeWidth={2.5} />
      Try again
    </button>
  );
}
