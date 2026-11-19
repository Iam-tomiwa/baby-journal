"use client";

import { Share, SquarePlus, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { SITE_SHORT_NAME } from "@/lib/site";

/** Chrome, Edge and Android browsers fire this when the app can be installed. */
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "journal:install-dismissed-at";
const SNOOZE_DAYS = 30;
/** Let people look around before asking. */
const DELAY_MS = 12_000;

function recentlyDismissed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(DISMISSED_KEY));
    return at > 0 && Date.now() - at < SNOOZE_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

function alreadyInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's own flag for a page opened from the home screen.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac, but a Mac has no touch screen.
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

const primary =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-base font-semibold text-paper transition-transform duration-150 ease-out-expo hover:scale-[1.03] active:scale-[0.97]";
const quiet =
  "inline-flex min-h-11 items-center rounded-full px-3 text-base font-semibold text-ink underline decoration-ink/40";

/**
 * Offers to put the journal on the home screen. Where the browser can install
 * it directly (Chrome, Edge, Android) the button does it; on iPhone and iPad,
 * where only the person can, it shows the two taps. It appears once, after a
 * short while, and stays away for a month if dismissed.
 */
export function InstallPrompt() {
  const installEvent = useRef<InstallEvent | null>(null);
  const [mode, setMode] = useState<"hidden" | "button" | "ios">("hidden");

  useEffect(() => {
    // Never on the offline page: there is nothing to install from there.
    if (alreadyInstalled() || recentlyDismissed() || window.location.pathname === "/offline") return;
    let timer: number | undefined;
    const startedAt = Date.now();
    const showAfterDelay = (next: "button" | "ios") => {
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => setMode(next),
        Math.max(0, DELAY_MS - (Date.now() - startedAt)),
      );
    };

    const onInstallable = (event: Event) => {
      // Hold the browser's own mini-bar back; ours explains what it is for.
      event.preventDefault();
      installEvent.current = event as InstallEvent;
      showAfterDelay("button");
    };
    const onInstalled = () => {
      installEvent.current = null;
      setMode("hidden");
    };

    window.addEventListener("beforeinstallprompt", onInstallable);
    window.addEventListener("appinstalled", onInstalled);
    if (isIos()) showAfterDelay("ios");

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* Private browsing: it may simply ask again next visit. */
    }
    setMode("hidden");
  }

  async function install() {
    const event = installEvent.current;
    if (!event) return dismiss();
    await event.prompt();
    const { outcome } = await event.userChoice;
    installEvent.current = null;
    if (outcome === "accepted") setMode("hidden");
    else dismiss();
  }

  const visible = mode !== "hidden";

  return (
    <AnimatePresence>
      {visible ? (
        <m.aside
          data-install-prompt
          aria-labelledby="install-prompt-title"
          initial={{ opacity: 0, y: -24, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{
            opacity: 0,
            y: -16,
            transition: { duration: 0.15, ease: "easeIn" },
          }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-40 mx-auto max-w-sm rounded-3xl border-2 border-ink bg-paper p-4 text-ink shadow-lifted sm:inset-x-auto sm:left-6 sm:top-auto sm:bottom-6 sm:mx-0"
        >
          <button
            type="button"
            onClick={dismiss}
            aria-label="Not now"
            className="absolute right-1.5 top-1.5 inline-flex size-11 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-muted"
          >
            <X aria-hidden="true" className="size-5" strokeWidth={2.5} />
          </button>

          <div className="flex items-start gap-3.5 pr-9">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={56}
              height={56}
              unoptimized
              className="size-14 shrink-0 -rotate-3 rounded-2xl shadow-print"
            />
            <div className="min-w-0">
              <h2
                id="install-prompt-title"
                className="font-display text-[1.3rem] leading-[1.05]"
              >
                {/* Phones and tablets have a home screen; a laptop has a dock or desktop. */}
                <span className="pointer-fine:hidden">
                  Keep the journal on your home screen
                </span>
                <span className="pointer-coarse:hidden">
                  Install the journal as an app
                </span>
              </h2>
              <p className="mt-1.5 text-base leading-snug">
                {mode === "ios"
                  ? "It opens like an app, with no address bar. Two taps:"
                  : "It opens like an app, with its own icon and no address bar."}
              </p>
            </div>
          </div>

          {mode === "ios" ? (
            <>
              <ol className="mt-4 grid gap-2.5 text-base">
                <li className="flex items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <Share
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={2.25}
                    />
                  </span>
                  <span>
                    Tap <strong className="font-semibold">Share</strong> in the
                    browser&rsquo;s toolbar
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <SquarePlus
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={2.25}
                    />
                  </span>
                  <span>
                    Choose{" "}
                    <strong className="font-semibold">
                      Add to Home Screen
                    </strong>
                  </span>
                </li>
              </ol>
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={dismiss} className={primary}>
                  Got it
                </button>
              </div>
            </>
          ) : (
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" onClick={dismiss} className={quiet}>
                Not now
              </button>
              <button
                type="button"
                onClick={() => void install()}
                className={primary}
              >
                Install {SITE_SHORT_NAME}
              </button>
            </div>
          )}
        </m.aside>
      ) : null}
    </AnimatePresence>
  );
}
