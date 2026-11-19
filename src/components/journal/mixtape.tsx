"use client";

import { Play } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useState } from "react";
import { TONES } from "@/lib/palette";
import { parseSongUrl } from "@/lib/songs";
import type { Song } from "@/lib/types";
import { cn } from "@/lib/utils";
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
  className,
}: {
  title: string;
  provider: string;
  tone: string;
  spinning?: boolean;
  className?: string;
}) {
  return (
    <span
      data-tone={tone}
      className={cn(
        "@container flex aspect-[1.38] w-full flex-col rounded-2xl bg-tone p-[5%] text-left shadow-print",
        className,
      )}
    >
      <span className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-lg bg-paper px-3 py-2 text-ink">
        <span className="line-clamp-2 font-hand text-[clamp(0.9rem,8.5cqi,1.3rem)] leading-[1.08]">
          {title}
        </span>
        <span className="pt-1 text-xs font-semibold leading-none">
          {provider}
        </span>
      </span>
      <span className="mx-auto mt-[5%] flex h-[24%] w-[64%] items-center justify-between rounded-full bg-ink px-[7%]">
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

/** The last page of the journal: the songs that belonged to this time, as a shelf of tapes. */
export function Mixtape({
  songs,
  childName,
}: {
  songs: Song[];
  childName: string;
}) {
  const [selectedId, setSelectedId] = useState(songs[0]?.id);
  const [playing, setPlaying] = useState(false);
  const selected = songs.find((song) => song.id === selectedId) ?? songs[0];

  return (
    <section
      id="mixtape"
      data-chapter
      data-sheet="album"
      aria-labelledby="mixtape-title"
      className="sheet pinked relative px-5 pb-32 pt-16 text-paper sm:px-8 md:pt-24 lg:pb-28 lg:pr-24"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="mixtape-title"
          className="font-display text-[clamp(2.6rem,9vw,5.5rem)] leading-[0.95] text-butter"
        >
          {childName}&rsquo;s mixtape
        </h2>
        <p className="mt-3 max-w-[40ch] font-hand text-[1.5rem] leading-tight">
          The songs that were playing while all of this happened.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-14">
          <div className="lg:sticky lg:top-10 lg:order-2">
            {playing ? (
              <SongPlayer
                key={selected.id}
                url={selected.url}
                title={selected.title}
                autoplay
              />
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center lg:flex-col lg:items-start xl:flex-row xl:items-center">
                {selected.thumbnail ? (
                  <span className="relative block aspect-video w-full max-w-sm overflow-hidden rounded-xl shadow-print">
                    <Image
                      src={selected.thumbnail}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 640px) 384px, 92vw"
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <Cassette
                    title={selected.title}
                    provider={
                      parseSongUrl(selected.url)?.provider === "spotify"
                        ? "Spotify"
                        : "YouTube"
                    }
                    tone={TONES[songs.indexOf(selected) % TONES.length]}
                    className="max-w-sm -rotate-2"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="inline-flex min-h-14 shrink-0 items-center gap-3 rounded-full bg-butter px-7 text-base font-semibold text-ink transition-transform duration-200 ease-out-expo hover:scale-105 active:scale-95"
                >
                  <Play aria-hidden="true" className="size-4 fill-current" />
                  Play it
                </button>
              </div>
            )}
            {selected.note ? (
              <p className="mt-5 font-hand text-[1.4rem] leading-snug text-butter">
                {selected.note}
              </p>
            ) : null}
          </div>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:order-1 lg:grid-cols-2 lg:gap-6">
            {songs.map((song, i) => (
              <li key={song.id}>
                <m.button
                  type="button"
                  aria-pressed={song.id === selected.id}
                  aria-label={`Play ${song.title}`}
                  onClick={() => {
                    setSelectedId(song.id);
                    setPlaying(true);
                  }}
                  whileHover={{ y: -4, rotate: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "block w-full rounded-2xl",
                    song.id === selected.id &&
                      "outline-3 outline-offset-4 outline-butter",
                  )}
                >
                  <Cassette
                    title={song.title}
                    provider={
                      parseSongUrl(song.url)?.provider === "spotify"
                        ? "Spotify"
                        : "YouTube"
                    }
                    tone={TONES[i % TONES.length]}
                    spinning={playing && song.id === selected.id}
                  />
                </m.button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
