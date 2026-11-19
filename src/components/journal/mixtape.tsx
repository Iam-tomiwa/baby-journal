"use client";

import { Music, X } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useId, useRef, useState } from "react";
import { TONES } from "@/lib/palette";
import { parseSongUrl } from "@/lib/songs";
import type { Song } from "@/lib/types";
import { cn } from "@/lib/utils";
import { JOURNAL_OPENED } from "./cover-opening";
import { SongPlayer } from "./song-player";

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

/**
 * The journal's songs, kept one tap away: a floating button that opens the
 * mixtape as a small panel of tapes. A song keeps playing after the panel is
 * closed, because the player stays mounted and is only hidden.
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
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playing = songs.find((song) => song.id === playingId) ?? null;
  const { scrollY } = useScroll();

  // Opening the journal starts the first song, once per visit. Scrolling the
  // cover open counts too, though browsers only allow sound after a tap or click.
  const autoStarted = useRef(false);
  const firstSongId = songs[0]?.id ?? null;
  function startFirstSong() {
    if (autoStarted.current || !firstSongId) return;
    autoStarted.current = true;
    setPlayingId((current) => current ?? firstSongId);
  }

  useEffect(() => {
    const onOpened = () => {
      if (autoStarted.current || !firstSongId) return;
      autoStarted.current = true;
      setPlayingId((current) => current ?? firstSongId);
    };
    window.addEventListener(JOURNAL_OPENED, onOpened);
    return () => window.removeEventListener(JOURNAL_OPENED, onOpened);
  }, [firstSongId]);

  // Like the index tabs, it waits until the cover has been opened.
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > window.innerHeight * 1.05;
    setShown((current) => (current === next ? current : next));
    if (next) startFirstSong();
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

  const visible = shown || open || playing !== null;

  return (
    <div
      ref={root}
      data-mixtape
      inert={!visible}
      className={cn(
        "fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-3 transition-[opacity,translate] duration-300 ease-out-expo lg:bottom-6 lg:right-6",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0",
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
          open ? null : "pointer-events-none",
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

        {playing ? (
          <div className="px-5 pb-3">
            <SongPlayer
              key={playing.id}
              url={playing.url}
              title={playing.title}
              autoplay
            />
          </div>
        ) : null}

        <ul className="grid gap-1 overflow-y-auto overscroll-contain px-3 pb-4">
          {songs.map((song, i) => {
            const current = song.id === playingId;
            const provider =
              parseSongUrl(song.url)?.provider === "spotify"
                ? "Spotify"
                : "YouTube";
            return (
              <li key={song.id}>
                <button
                  type="button"
                  onClick={() => setPlayingId(song.id)}
                  aria-pressed={current}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors duration-150",
                    current ? "bg-paper/15" : "hover:bg-paper/10",
                  )}
                >
                  <span className="w-[4.5rem] shrink-0">
                    <Cassette
                      title=""
                      provider=""
                      tone={TONES[i % TONES.length]}
                      spinning={current}
                      bare
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-hand text-[1.2rem] leading-tight">
                      {song.title}
                    </span>
                    <span className="mt-0.5 block text-xs font-semibold text-butter">
                      {current ? "Playing" : provider}
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
          playing
            ? `${childName}'s mixtape, playing ${playing.title}`
            : `${childName}'s mixtape, ${songs.length === 1 ? "1 song" : `${songs.length} songs`}`
        }
        whileHover={{ scale: 1.06, rotate: -4 }}
        whileTap={{ scale: 0.94 }}
        className="inline-flex h-14 min-w-14 items-center justify-center gap-2.5 rounded-full border-2 border-butter bg-ink px-4 text-butter shadow-lifted"
      >
        {playing ? (
          <Equaliser />
        ) : (
          <Music aria-hidden="true" className="size-6" strokeWidth={2.25} />
        )}
        {playing ? (
          <span className="max-w-32 truncate pr-1 font-hand text-[1.1rem] leading-none">
            {playing.title}
          </span>
        ) : null}
      </m.button>
    </div>
  );
}
