"use client";

import { ArrowLeft, ArrowRight, Music, X } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Placed } from "@/lib/chapters";
import { posterSrc, videoSrc } from "@/lib/media";
import { SongPlayer } from "./song-player";

const roundButton =
  "inline-flex size-12 items-center justify-center rounded-full bg-paper text-ink shadow-print transition-transform duration-150 ease-out-expo hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40";

/**
 * A print lifted off the page. The image shares a layoutId with its place in
 * the chapter, so it travels there and back instead of appearing from nowhere.
 */
export function Lightbox({
  item,
  onClose,
  onStep,
  hasPrev,
  hasNext,
}: {
  item: Placed;
  onClose: () => void;
  onStep: (direction: -1 | 1) => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [songFor, setSongFor] = useState<string | null>(null);
  const media = item.media!;
  const ratio = media.width / media.height;

  // Hold the page still and hand focus back to the print when the reader closes.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    root.dataset.reader = "open";
    closeButton.current?.focus();
    return () => {
      root.style.overflow = previous;
      delete root.dataset.reader;
      opener?.focus({ preventScroll: true });
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") onClose();
    if (event.key === "ArrowLeft" && hasPrev) onStep(-1);
    if (event.key === "ArrowRight" && hasNext) onStep(1);
    if (event.key !== "Tab" || !dialog.current) return;
    const focusable = dialog.current.querySelectorAll<HTMLElement>(
      "button:not([disabled]), a[href], video[controls], iframe",
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
    >
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={onClose}
        className="fixed inset-0 bg-ink/[0.97]"
      />

      <div className="pointer-events-none relative flex min-h-full flex-col items-center justify-center px-4 py-20">
        <div
          className="flex flex-col gap-5"
          style={{
            width: `max(min(92vw, 20rem), min(92vw, calc(64svh * ${ratio})))`,
          }}
        >
          <m.div
            layoutId={`media-${item.id}`}
            className="pointer-events-auto relative mx-auto overflow-hidden rounded-[3px] bg-ink shadow-lifted ring-[6px] ring-paper sm:ring-8"
            style={{
              aspectRatio: `${media.width} / ${media.height}`,
              width: `min(100%, calc(64svh * ${ratio}))`,
            }}
          >
            <Image
              src={posterSrc(media)}
              alt={media.kind === "image" ? item.title : ""}
              fill
              sizes="(min-width: 1024px) 70vw, 92vw"
              className="object-cover"
            />
            {media.kind === "video" ? (
              <video
                key={item.id}
                src={videoSrc(media)}
                controls
                autoPlay
                playsInline
                preload="metadata"
                aria-label={item.title}
                className="absolute inset-0 size-full bg-ink object-contain"
              />
            ) : null}
          </m.div>

          <m.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ delay: 0.12, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto w-full text-paper"
          >
            <h2 className="font-hand text-[1.75rem] leading-tight">
              {item.title}
            </h2>
            {item.body ? (
              <p className="mt-1 max-w-[60ch] text-base leading-relaxed">
                {item.body}
              </p>
            ) : null}
            <p className="mt-2 text-sm text-butter">
              {item.dateLong}, {item.age}
            </p>
            {item.songUrl ? (
              songFor === item.id ? (
                <SongPlayer
                  url={item.songUrl}
                  title={`Song for ${item.title}`}
                  autoplay
                  className="mt-4"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setSongFor(item.id)}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-butter px-5 text-sm font-semibold text-ink transition-transform duration-150 ease-out-expo hover:scale-[1.03] active:scale-[0.97]"
                >
                  <Music
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={2.5}
                  />
                  Play the song from that day
                </button>
              )
            ) : null}
          </m.div>
        </div>
      </div>

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none fixed inset-x-0 top-0 flex justify-end p-3 sm:p-5"
      >
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`${roundButton} pointer-events-auto`}
        >
          <X aria-hidden="true" className="size-5" strokeWidth={2.5} />
        </button>
      </m.div>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-center gap-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:inset-y-0 lg:items-center lg:justify-between lg:p-5"
      >
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={!hasPrev}
          aria-label="Previous memory"
          className={`${roundButton} pointer-events-auto`}
        >
          <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={!hasNext}
          aria-label="Next memory"
          className={`${roundButton} pointer-events-auto`}
        >
          <ArrowRight aria-hidden="true" className="size-5" strokeWidth={2.5} />
        </button>
      </m.div>
    </div>
  );
}
