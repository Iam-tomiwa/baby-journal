"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production builds. In development it stays
 * off, so cached pages never get in the way of seeing a change.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Installing is a nicety; the journal works without it.
      });
  }, []);
  return null;
}
