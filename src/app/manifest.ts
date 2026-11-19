import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/site";

/** Lets phones and desktops install the journal as an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description:
      "A baby journal for photos, videos, firsts, notes and the songs that went with them.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // The butter sheet of the shelf, so the launch screen matches the first page.
    background_color: "#f7d774",
    theme_color: "#f7d774",
    categories: ["lifestyle", "photo"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Add a memory",
        short_name: "Add",
        url: "/parents",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
    ],
  };
}
