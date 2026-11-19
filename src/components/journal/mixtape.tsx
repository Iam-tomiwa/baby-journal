"use client";

import { Music, Pause, Play, X } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useId, useRef, useState } from "react";
import { TONES } from "@/lib/palette";
import { providerLabel } from "@/lib/songs";
import type { Song } from "@/lib/types";
import { cn } from "@/lib/utils";
import { JOURNAL_OPENED } from "./cover-opening";
import { SongPlayer } from "./song-player";
import { useSongEngine } from "./use-song-engine";

function Reel({ spinning }: { spinning: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[62%] text-paper motion-safe:[animation:reel_2.4s_linear_infinite]"
      style={{ animationPlayState: spinning ? "running" : "paused" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M12 2v6M3.3 17l5.2-3M20.7 17l-5.2-3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A tape with a handwritten label. Purely visual; wrap it in a button to make it playable. */
export function Cassette({
  title,
  provider,
  tone,
  spinning = false,
  bare = false,
  className,
}: {
  title: string;
  provider: string;
  tone: string;
  spinning?: boolean;
  /** Drop the written label; for when the tape is used as a small icon. */
  bare?: boolean;
  className?: string;
}) {
  return (
    <span
      data-tone={tone}
      className={cn(
        "@container flex aspect-[1.38] w-full flex-col bg-tone p-[5%] text-left shadow-print",
        bare ? "rounded-lg" : "rounded-2xl",
        className,
      )}
    >
      {bare ? (
        <span className="min-h-0 flex-1 rounded-[3px] bg-paper" />
      ) : (
        <span className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-lg bg-paper px-3 py-2 text-ink">
          <span className="line-clamp-2 font-hand text-[clamp(0.9rem,8.5cqi,1.3rem)] leading-[1.08]">
            {title}
          </span>
          <span className="pt-1 text-xs font-semibold leading-none">
            {provider}
          </span>
        </span>
      )}
      <span
        className={cn(
          "mx-auto mt-[5%] flex w-[64%] items-center justify-between rounded-full bg-ink px-[7%]",
          bare ? "h-[34%]" : "h-[24%]",
        )}
      >
        <span className="flex aspect-square h-full items-center justify-center">
          <Reel spinning={spinning} />
        </span>
        <span className="flex aspect-square h-full items-center justify-center">
          <Reel spinning={spinning} />
        </span>
      </span>
    </span>
  );
}

/** Three bars that bounce while a song is playing. */
function Equaliser() {
  return (
    <span aria-hidden="true" className="flex h-5 items-end gap-[3px]">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="block w-[4px] origin-bottom rounded-full bg-current motion-safe:[animation:equalise_0.9s_ease-in-out_infinite]"
          style={{ height: "100%", animationDelay: `${bar * -0.3}s` }}
        />
      ))}
    </span>
  );
}

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

/**
 * The journal's songs, kept one tap away: a floating button that opens the
 * mixtape as a small panel of tapes. A song keeps playing after the panel is
 * closed, because the players stay mounted and are only hidden.
 *
 * Opening the journal starts the first song. Browsers only allow sound after a
 * tap, click or key press, so if the reader scrolled the cover open without
 * touching anything yet, the song starts on their first tap instead.
 */
export function Mixtape({
  songs,
  childName,
}: {
  songs: Song[];
  childName: string;
}) {
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const audioEl = useRef<HTMLAudioElement>(null);
  const spotifyHost = useRef<HTMLDivElement>(null);
  const engine = useSongEngine(songs, { audio: audioEl, spotifyHost });
  const { current, first, playing, progress } = engine;
  const { scrollY } = useScroll();

  // Start the first song once per visit, as soon as the browser will allow sound.
  const autoStarted = useRef(false);
  const startFirst = useRef<() => void>(() => undefined);
  const live = useRef({ playing, currentId: current?.id ?? null });
  useEffect(() => {
    live.current = { playing, currentId: current?.id ?? null };
    startFirst.current = () => {
      if (autoStarted.current || !first) return;
      autoStarted.current = true;
      // The reader may have picked something themselves in the meantime.
      if (!live.current.currentId) engine.play(first);

      // If the browser refused (no tap yet, or a stricter policy), the reader's
      // first tap, click or key press anywhere starts it instead.
      const events = ["click", "touchend", "keydown"] as const;
      const onFirstTouch = () => {
        events.forEach((name) =>
          window.removeEventListener(name, onFirstTouch, true),
        );
        const { playing: isPlaying, currentId } = live.current;
        if (!isPlaying && (currentId === null || currentId === first.id))
          engine.play(first);
      };
      events.forEach((name) =>
        window.addEventListener(name, onFirstTouch, true),
      );
    };
  });

  useEffect(() => {
    const onOpened = () => startFirst.current();
    window.addEventListener(JOURNAL_OPENED, onOpened);
    return () => window.removeEventListener(JOURNAL_OPENED, onOpened);
  }, []);

  // Like the index tabs, it waits until the cover has been opened.
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > window.innerHeight * 1.05;
    setShown((value) => (value === next ? value : next));
    if (next) startFirst.current();
  });

  // Close on Escape or a press anywhere outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPress = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPress);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPress);
    };
  }, [open]);

  const visible = shown || open || current !== null;
  const provider = current?.embed.provider ?? null;

  return (
    <div
      ref={root}
      data-mixtape
      inert={!visible}
      className={cn(
        "fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-3 transition-[opacity,translate] duration-300 ease-out-expo lg:bottom-6 lg:right-6",
        // The wrapper spans the closed panel's box, so it must never catch taps itself;
        // only the button and the open panel do.
        "pointer-events-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
    >
      <m.section
        id={panelId}
        aria-label={`${childName}'s mixtape`}
        inert={!open}
        data-sheet="album"
        initial={false}
        animate={
          open
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 0, scale: 0.92, y: 16 }
        }
        transition={
          open
            ? { type: "spring", stiffness: 380, damping: 28 }
            : { duration: 0.15, ease: "easeIn" }
        }
        className={cn(
          "sheet flex max-h-[min(34rem,calc(100svh-11rem))] w-[min(22rem,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl text-paper shadow-lifted",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <h2 className="font-display text-[1.6rem] leading-none text-butter">
              {childName}&rsquo;s mixtape
            </h2>
            <p className="mt-1.5 font-hand text-[1.1rem] leading-tight">
              The songs that were playing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close the mixtape"
            className="-mr-2 -mt-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-paper transition-colors duration-150 hover:bg-paper/15"
          >
            <X aria-hidden="true" className="size-5" strokeWidth={2.5} />
          </button>
        </header>

        {/* The players. All three stay in the page so sound survives the panel closing. */}
        <div className={cn("px-5", current ? "pb-3" : null)}>
          {/* Spotify builds its own audio player inside this element. */}
          <div
            ref={spotifyHost}
            className={cn(
              "overflow-hidden rounded-xl",
              provider === "spotify" ? null : "hidden",
            )}
          />

          <audio ref={audioEl} {...engine.audioEvents} className="hidden" />
          {current && provider === "audio" ? (
            <div className="flex items-center gap-3 rounded-2xl bg-paper/10 p-3">
              <button
                type="button"
                onClick={() => engine.toggle(current)}
                aria-label={
                  playing ? `Pause ${current.title}` : `Play ${current.title}`
                }
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-butter text-ink transition-transform duration-150 ease-out-expo hover:scale-105 active:scale-95"
              >
                {playing ? (
                  <Pause aria-hidden="true" className="size-5 fill-current" />
                ) : (
                  <Play
                    aria-hidden="true"
                    className="size-5 translate-x-px fill-current"
                  />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-hand text-[1.15rem] leading-tight">
                  {current.title}
                </p>
                <input
                  type="range"
                  min={0}
                  max={progress.duration || 0}
                  step={1}
                  value={Math.min(progress.position, progress.duration || 0)}
                  onChange={(event) => engine.seek(Number(event.target.value))}
                  aria-label="Position in the recording"
                  className="mt-1.5 block h-1.5 w-full cursor-pointer accent-butter"
                />
                <p className="mt-1 text-xs font-semibold tabular-nums text-butter">
                  {clock(progress.position)} / {clock(progress.duration)}
                </p>
              </div>
            </div>
          ) : null}

          {current && provider === "youtube" ? (
            <SongPlayer
              key={current.id}
              url={current.url}
              title={current.title}
              autoplay
            />
          ) : null}
        </div>

        <ul className="grid gap-1 overflow-y-auto overscroll-contain px-3 pb-4">
          {engine.playable.map((song, i) => {
            const selected = song.id === current?.id;
            return (
              <li key={song.id}>
                <button
                  type="button"
                  onClick={() => engine.toggle(song)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors duration-150",
                    selected ? "bg-paper/15" : "hover:bg-paper/10",
                  )}
                >
                  <span className="w-[4.5rem] shrink-0">
                    <Cassette
                      title=""
                      provider=""
                      tone={TONES[i % TONES.length]}
                      spinning={selected && playing}
                      bare
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-hand text-[1.2rem] leading-tight">
                      {song.title}
                    </span>
                    <span className="mt-0.5 block text-xs font-semibold text-butter">
                      {selected
                        ? playing
                          ? "Playing"
                          : "Ready to play"
                        : providerLabel(song.url)}
                    </span>
                    {song.note ? (
                      <span className="mt-1 block text-sm leading-snug text-paper">
                        {song.note}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </m.section>

      <m.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          current
            ? `${childName}'s mixtape, ${playing ? "playing" : "ready to play"} ${current.title}`
            : `${childName}'s mixtape, ${songs.length === 1 ? "1 song" : `${songs.length} songs`}`
        }
        whileHover={{ scale: 1.06, rotate: -4 }}
        whileTap={{ scale: 0.94 }}
        className="pointer-events-auto inline-flex h-14 min-w-14 items-center justify-center gap-2.5 rounded-full border-2 border-butter bg-ink px-4 text-butter shadow-lifted"
      >
        {current && playing ? (
          <Equaliser />
        ) : (
          <Music aria-hidden="true" className="size-6" strokeWidth={2.25} />
        )}
        {current ? (
          <span className="max-w-32 truncate pr-1 font-hand text-[1.1rem] leading-none">
            {current.title}
          </span>
        ) : null}
      </m.button>
    </div>
  );
}
