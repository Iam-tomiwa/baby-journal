import type { Media } from "./types";

const CLOUDINARY = "https://res.cloudinary.com/";

/** Still image for a piece of media: the image itself, or a frame of the video. */
export function posterSrc(media: Media): string {
  if (media.kind === "image") return media.src;
  return media.src.replace(/\.[a-z0-9]+$/i, ".jpg");
}

/** Streamable source for a video, transcoded and capped by Cloudinary. */
export function videoSrc(media: Media): string {
  if (!media.src.startsWith(CLOUDINARY)) return media.src;
  return media.src.replace("/upload/", "/upload/f_auto,q_auto,c_limit,w_1280/");
}

export function isLandscape(media: Media): boolean {
  return media.width >= media.height;
}
