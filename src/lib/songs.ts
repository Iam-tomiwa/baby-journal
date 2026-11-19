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

/** Reads YouTube's time formats ("50", "50s", "1m30s", "1h2m3s") as whole seconds; 0 if absent or odd. */
function startSeconds(value: string | null): number {
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const parts = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
  if (!parts || parts[0] === "") return 0;
  return (
    Number(parts[1] ?? 0) * 3600 +
    Number(parts[2] ?? 0) * 60 +
    Number(parts[3] ?? 0)
  );
}

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
    // A link copied "at current time" (?t=50, ?t=1m30s, ?start=50) starts the player there.
    const start = startSeconds(
      url.searchParams.get("t") ?? url.searchParams.get("start"),
    );
    const query = new URLSearchParams();
    if (list) query.set("list", list);
    if (start > 0) query.set("start", String(start));
    const suffix = query.size > 0 ? `?${query}` : "";
    return {
      provider: "youtube",
      kind: "track",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}${suffix}`,
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
