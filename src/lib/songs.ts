export type SongProvider = "youtube" | "spotify" | "audio";

export type SongEmbed = {
  provider: SongProvider;
  /** A single track, video or recording, or a collection. */
  kind: "track" | "playlist";
  /** What to load: the provider's player page, or the audio file itself. */
  embedUrl: string;
  /** Height the provider's player needs, in px. YouTube is 16:9 instead; audio has its own bar. */
  height: number | null;
  /** Seconds into the song to start from; 0 means the beginning. */
  startAt: number;
  /** `spotify:track:…`, for Spotify's player controller. */
  spotifyUri?: string;
};

const SPOTIFY_TYPES = new Set(["track", "album", "playlist", "episode", "show"]);
const AUDIO_FILE = /\/video\/upload\/.+\.(mp3|m4a|aac|wav|ogg|oga|flac|webm)$/i;

/** Reads time formats ("50", "50s", "1m30s", "1h2m3s", "0:50") as whole seconds; 0 if absent or odd. */
export function startSeconds(value: string | null | undefined): number {
  if (!value) return 0;
  const text = value.trim();
  if (/^\d+$/.test(text)) return Number(text);
  const clock = text.match(/^(?:(\d+):)?(\d{1,2}):(\d{2})$/);
  if (clock) return Number(clock[1] ?? 0) * 3600 + Number(clock[2]) * 60 + Number(clock[3]);
  const parts = text.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!parts || parts[0] === "") return 0;
  return Number(parts[1] ?? 0) * 3600 + Number(parts[2] ?? 0) * 60 + Number(parts[3] ?? 0);
}

/** A start time kept on the link itself as `#t=50`, the standard media-fragment form. */
function fragmentStart(url: URL): number {
  const match = url.hash.match(/^#t=(.+)$/);
  return match ? startSeconds(match[1]) : 0;
}

/** Adds, replaces or removes the `#t=` start time on a song link. */
export function withStart(link: string, seconds: number): string {
  const base = link.trim().replace(/#.*$/, "");
  return seconds > 0 ? `${base}#t=${seconds}` : base;
}

/**
 * Turns a pasted YouTube or Spotify link, or one of this journal's uploaded
 * recordings, into something playable. Returns null for anything else.
 */
export function parseSongUrl(input: string): SongEmbed | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\.|^m\.|^music\./, "");

  if (host === "res.cloudinary.com" && AUDIO_FILE.test(url.pathname)) {
    return {
      provider: "audio",
      kind: "track",
      embedUrl: `${url.origin}${url.pathname}`,
      height: null,
      startAt: fragmentStart(url),
    };
  }

  if (host === "open.spotify.com") {
    // Paths may carry a locale prefix: /intl-fr/track/<id>
    const parts = url.pathname.split("/").filter(Boolean);
    const at = parts.findIndex((p) => SPOTIFY_TYPES.has(p));
    const id = parts[at + 1];
    if (at === -1 || !id || !/^[A-Za-z0-9]+$/.test(id)) return null;
    const type = parts[at];
    const single = type === "track" || type === "episode";
    const startAt = fragmentStart(url) || startSeconds(url.searchParams.get("t"));
    return {
      provider: "spotify",
      kind: single ? "track" : "playlist",
      embedUrl: `https://open.spotify.com/embed/${type}/${id}${startAt > 0 ? `?t=${startAt}` : ""}`,
      height: single ? 152 : 352,
      startAt,
      spotifyUri: `spotify:${type}:${id}`,
    };
  }

  if (host === "youtu.be" || host === "youtube.com") {
    const list = url.searchParams.get("list");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")) {
      id = url.pathname.split("/")[2] ?? null;
    }
    if (id && !/^[\w-]{6,}$/.test(id)) id = null;
    if (list && !/^[\w-]+$/.test(list)) return null;
    if (!id && list) {
      return {
        provider: "youtube",
        kind: "playlist",
        embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`,
        height: null,
        startAt: 0,
      };
    }
    if (!id) return null;
    // A link copied "at current time" (?t=50, ?t=1m30s, ?start=50) starts the player there.
    const startAt =
      startSeconds(url.searchParams.get("t") ?? url.searchParams.get("start")) || fragmentStart(url);
    const query = new URLSearchParams();
    if (list) query.set("list", list);
    if (startAt > 0) query.set("start", String(startAt));
    const suffix = query.size > 0 ? `?${query}` : "";
    return {
      provider: "youtube",
      kind: "track",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}${suffix}`,
      height: null,
      startAt,
    };
  }

  return null;
}

/** The word shown for where a song comes from. */
export function providerLabel(link: string): string {
  const provider = parseSongUrl(link)?.provider;
  if (provider === "spotify") return "Spotify";
  if (provider === "audio") return "Our recording";
  return "YouTube";
}

/** Endpoint that returns a title and thumbnail for a YouTube or Spotify link. */
export function oembedUrl(url: string, provider: "youtube" | "spotify"): string {
  const base =
    provider === "spotify" ? "https://open.spotify.com/oembed" : "https://www.youtube.com/oembed";
  return `${base}?format=json&url=${encodeURIComponent(url.replace(/#.*$/, ""))}`;
}
