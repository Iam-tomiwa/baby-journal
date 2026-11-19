export type SongEmbed = {
  provider: "youtube" | "spotify";
  /** A single track or video, or a collection. */
  kind: "track" | "playlist";
  embedUrl: string;
  /** Height the provider's player needs, in px. YouTube is 16:9 instead. */
  height: number | null;
};

const SPOTIFY_TYPES = new Set([
  "track",
  "album",
  "playlist",
  "episode",
  "show",
]);

/** Turns a pasted YouTube or Spotify link into its embeddable player, or null. */
export function parseSongUrl(input: string): SongEmbed | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\.|^m\.|^music\./, "");

  if (host === "open.spotify.com") {
    // Paths may carry a locale prefix: /intl-fr/track/<id>
    const parts = url.pathname.split("/").filter(Boolean);
    const at = parts.findIndex((p) => SPOTIFY_TYPES.has(p));
    const id = parts[at + 1];
    if (at === -1 || !id || !/^[A-Za-z0-9]+$/.test(id)) return null;
    const type = parts[at];
    const single = type === "track" || type === "episode";
    return {
      provider: "spotify",
      kind: single ? "track" : "playlist",
      embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
      height: single ? 152 : 352,
    };
  }

  if (host === "youtu.be" || host === "youtube.com") {
    const list = url.searchParams.get("list");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (
      url.pathname.startsWith("/shorts/") ||
      url.pathname.startsWith("/embed/")
    ) {
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
      };
    }
    if (!id) return null;
    return {
      provider: "youtube",
      kind: "track",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}${list ? `?list=${list}` : ""}`,
      height: null,
    };
  }

  return null;
}

/** Endpoint that returns a title and thumbnail for a supported link. */
export function oembedUrl(
  url: string,
  provider: SongEmbed["provider"],
): string {
  const base =
    provider === "spotify"
      ? "https://open.spotify.com/oembed"
      : "https://www.youtube.com/oembed";
  return `${base}?format=json&url=${encodeURIComponent(url)}`;
}
