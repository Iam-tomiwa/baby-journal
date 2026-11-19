import { parseSongUrl } from "@/lib/songs";
import { cn } from "@/lib/utils";

/** The provider's own player. Only mount this once someone has asked to listen. */
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
  const src =
    autoplay && embed.provider === "youtube"
      ? `${embed.embedUrl}${embed.embedUrl.includes("?") ? "&" : "?"}autoplay=1`
      : embed.embedUrl;

  return (
    <iframe
      src={src}
      title={`${title}, on ${embed.provider === "spotify" ? "Spotify" : "YouTube"}`}
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
