import { parseSongUrl, providerLabel } from "@/lib/songs";
import { cn } from "@/lib/utils";

/**
 * A song's own player: the provider's embed for YouTube and Spotify, or the
 * browser's audio controls for an uploaded recording. Only mount this once
 * someone has asked to listen.
 */
export function SongPlayer({
  url,
  title,
  autoplay = false,
  className,
}: {
  url: string;
  title: string;
  autoplay?: boolean;
  className?: string;
}) {
  const embed = parseSongUrl(url);
  if (!embed) return null;

  if (embed.provider === "audio") {
    const src =
      embed.startAt > 0
        ? `${embed.embedUrl}#t=${embed.startAt}`
        : embed.embedUrl;
    return (
      <audio
        src={src}
        controls
        autoPlay={autoplay}
        preload="metadata"
        aria-label={title}
        className={cn("w-full", className)}
      />
    );
  }

  const src =
    autoplay && embed.provider === "youtube"
      ? `${embed.embedUrl}${embed.embedUrl.includes("?") ? "&" : "?"}autoplay=1`
      : embed.embedUrl;

  return (
    <iframe
      src={src}
      title={`${title}, on ${providerLabel(url)}`}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      style={embed.height ? { height: embed.height } : undefined}
      className={cn(
        "w-full rounded-xl border-0",
        embed.height ? null : "aspect-video",
        className,
      )}
    />
  );
}
