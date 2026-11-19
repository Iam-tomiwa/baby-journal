"use client";

type LoaderArgs = { src: string; width: number; quality?: number };

/**
 * One loader for every `next/image`: Cloudinary does the resizing and format
 * negotiation for uploaded media, Unsplash does it for the sample journal.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: LoaderArgs): string {
  if (src.startsWith("https://res.cloudinary.com/")) {
    const q = quality ? `q_${quality}` : "q_auto";
    return src.replace("/upload/", `/upload/f_auto,${q},c_limit,w_${width}/`);
  }
  if (src.startsWith("https://images.unsplash.com/")) {
    return `${src}?auto=format&fit=max&w=${width}&q=${quality ?? 70}`;
  }
  return src;
}
