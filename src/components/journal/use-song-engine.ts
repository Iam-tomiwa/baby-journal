"use client";

// This module drives imperative media players: an <audio> element and Spotify's
// embed controller. Starting, pausing and seeking them means mutating objects
// React does not own, which is exactly what this rule forbids for React values.
/* eslint-disable react-hooks/immutability */

import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  type SyntheticEvent,
} from "react";
import { parseSongUrl, type SongEmbed } from "@/lib/songs";
import type { Song } from "@/lib/types";

// The small part of Spotify's embed controller this app uses.
// https://developer.spotify.com/documentation/embeds/references/iframe-api
type SpotifyController = {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  destroy: () => void;
  addListener: (
    event: "ready" | "playback_update",
    handler: (event: {
      data: { isPaused: boolean; position: number; duration: number };
    }) => void,
  ) => void;
};
type SpotifyApi = {
  createController: (
    target: HTMLElement,
    options: { uri: string; width: string; height: number; startAt?: number },
    onCreated: (controller: SpotifyController) => void,
  ) => void;
};
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyApi) => void;
  }
}

let spotifyApi: Promise<SpotifyApi> | null = null;

/** Loads Spotify's player script once, the first time a Spotify song needs it. */
function loadSpotifyApi(): Promise<SpotifyApi> {
  spotifyApi ??= new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve;
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.onerror = () => {
      spotifyApi = null;
      reject(new Error("Spotify's player could not be loaded."));
    };
    document.head.append(script);
  });
  return spotifyApi;
}

export type EngineSong = Song & { embed: SongEmbed };

type Progress = { position: number; duration: number };

/** Spotify's live player, kept outside React state because it is not data. */
type Players = {
  spotify: { songId: string; controller: SpotifyController } | null;
  /** The Spotify song whose player is being built right now. */
  preparing: string | null;
  /** A song that should start as soon as its Spotify player is ready. */
  wantsPlay: string | null;
};

type Report = {
  setPlaying: (playing: boolean) => void;
  setProgress: (progress: Progress) => void;
};

/** Builds Spotify's player for a song inside the host element, replacing any other. */
async function prepareSpotify(
  song: EngineSong,
  players: Players,
  host: HTMLDivElement | null,
  report: Report,
): Promise<void> {
  const uri = song.embed.spotifyUri;
  if (!uri || !host) return;
  if (players.spotify?.songId === song.id || players.preparing === song.id)
    return;
  players.preparing = song.id;
  players.spotify?.controller.destroy();
  players.spotify = null;

  const api = await loadSpotifyApi();
  // Another song may have been chosen while the script was loading.
  if (players.preparing !== song.id || !host.isConnected) return;
  const target = document.createElement("div");
  host.replaceChildren(target);
  api.createController(
    target,
    {
      uri,
      width: "100%",
      height: song.embed.height ?? 152,
      startAt: song.embed.startAt || undefined,
    },
    (controller) => {
      players.spotify = { songId: song.id, controller };
      players.preparing = null;
      controller.addListener("playback_update", ({ data }) => {
        report.setPlaying(!data.isPaused);
        report.setProgress({
          position: data.position / 1000,
          duration: data.duration / 1000,
        });
      });
      controller.addListener("ready", () => {
        if (players.wantsPlay === song.id) {
          players.wantsPlay = null;
          controller.play();
        }
      });
    },
  );
}

/**
 * Plays the mixtape's songs, whatever they are:
 *  - an uploaded recording, through one <audio> element;
 *  - a Spotify link, through Spotify's own audio player, driven by its controller;
 *  - a YouTube link, through YouTube's player (a video; it starts itself).
 *
 * Browsers only allow sound after a tap, click or key press. So `play` does
 * its work synchronously where it can, and the first song's player is prepared
 * ahead of time so that pressing "Open the journal" can start it inside that
 * same press.
 */
export function useSongEngine(
  songs: Song[],
  /** The one <audio> element, and the element Spotify builds its player in. Both are rendered by the caller. */
  elements: {
    audio: RefObject<HTMLAudioElement | null>;
    spotifyHost: RefObject<HTMLDivElement | null>;
  },
) {
  const playable: EngineSong[] = songs.flatMap((song) => {
    const embed = parseSongUrl(song.url);
    return embed ? [{ ...song, embed }] : [];
  });

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState<Progress>({
    position: 0,
    duration: 0,
  });
  const players = useRef<Players>({
    spotify: null,
    preparing: null,
    wantsPlay: null,
  });

  const current = playable.find((song) => song.id === currentId) ?? null;
  const first = playable[0] ?? null;
  const firstUrl = first?.url ?? null;

  // Get the first song's player ready before anyone presses anything.
  useEffect(() => {
    const song = songs
      .map((s) => ({ ...s, embed: parseSongUrl(s.url) }))
      .find((s) => s.embed);
    if (!song?.embed) return;
    const audio = elements.audio.current;
    if (song.embed.provider === "spotify") {
      void prepareSpotify(
        song as EngineSong,
        players.current,
        elements.spotifyHost.current,
        {
          setPlaying,
          setProgress,
        },
      ).catch(() => undefined);
    }
    if (song.embed.provider === "audio" && audio && !audio.src) {
      audio.preload = "metadata";
      audio.src = song.embed.embedUrl;
    }
    // Keyed on the first song's link: the songs array itself is new on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstUrl]);

  useEffect(() => {
    const p = players.current;
    return () => p.spotify?.controller.destroy();
  }, []);

  /** Start a song. Call it from inside a tap, click or key press. */
  function play(song: EngineSong) {
    const p = players.current;
    const audio = elements.audio.current;
    const { embed } = song;
    // Whatever was playing through another route stops first.
    if (embed.provider !== "audio") audio?.pause();
    if (embed.provider !== "spotify" || p.spotify?.songId !== song.id)
      p.spotify?.controller.pause();

    setCurrentId(song.id);
    setProgress({ position: 0, duration: 0 });

    if (embed.provider === "audio" && audio) {
      if (!audio.src.startsWith(embed.embedUrl)) audio.src = embed.embedUrl;
      const begin = () => {
        if (embed.startAt > 0 && audio.currentTime < embed.startAt)
          audio.currentTime = embed.startAt;
      };
      if (audio.readyState >= 1) begin();
      else audio.addEventListener("loadedmetadata", begin, { once: true });
      void audio.play().catch(() => setPlaying(false));
      return;
    }

    if (embed.provider === "spotify") {
      if (p.spotify?.songId === song.id) {
        p.spotify.controller.play();
      } else {
        p.wantsPlay = song.id;
        void prepareSpotify(song, p, elements.spotifyHost.current, {
          setPlaying,
          setProgress,
        }).catch(() => setPlaying(false));
      }
      return;
    }

    // YouTube: the player is mounted by the panel with autoplay on.
    setPlaying(true);
  }

  /** Play a song, or pause and resume it if it is already the current one. */
  function toggle(song: EngineSong) {
    const audio = elements.audio.current;
    if (song.id !== currentId) return play(song);
    if (song.embed.provider === "audio" && audio) {
      if (audio.paused) void audio.play().catch(() => undefined);
      else audio.pause();
    } else if (song.embed.provider === "spotify") {
      players.current.spotify?.controller.togglePlay();
    }
  }

  function seek(seconds: number) {
    const audio = elements.audio.current;
    if (audio) audio.currentTime = seconds;
  }

  /** Attach these to the <audio> element. */
  const audioEvents = {
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onEnded: () => setPlaying(false),
    onTimeUpdate: (event: SyntheticEvent<HTMLAudioElement>) =>
      setProgress({
        position: event.currentTarget.currentTime,
        duration: event.currentTarget.duration || 0,
      }),
  };

  return {
    playable,
    first,
    current,
    playing,
    progress,
    play,
    toggle,
    seek,
    audioEvents,
  };
}
