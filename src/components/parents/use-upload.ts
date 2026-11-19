"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getUploadTicket } from "@/app/actions";

export type UploadedMedia = {
  publicId: string;
  url: string;
  type: "image" | "video";
  width: number;
  height: number;
};

export type UploadStatus =
  | { status: "uploading"; progress: number }
  | { status: "done"; media: UploadedMedia }
  | { status: "error"; message: string };

/** One chosen file: its local preview, its caption, and how its upload is going. */
export type UploadItem = {
  id: string;
  name: string;
  kind: "image" | "video";
  previewUrl: string;
  caption: string;
  upload: UploadStatus;
};

const MB = 1024 * 1024;
const LIMITS = { image: 20 * MB, video: 100 * MB };
/** How many photos or videos one pass of the form can add. */
export const MAX_FILES = 12;

type CloudinaryResponse = {
  public_id?: string;
  secure_url?: string;
  resource_type?: string;
  width?: number;
  height?: number;
  error?: { message?: string };
} | null;

/**
 * Sends files straight from the browser to Cloudinary with a server-signed
 * request, several at once, reporting progress for each. Files never pass
 * through this app's server.
 */
export function useUploads() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const requests = useRef(new Map<string, XMLHttpRequest>());
  const previews = useRef(new Set<string>());

  // Abort anything in flight and release every object URL when the form goes away.
  useEffect(() => {
    const live = requests.current;
    const urls = previews.current;
    return () => {
      live.forEach((xhr) => xhr.abort());
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const patch = useCallback((id: string, upload: UploadStatus) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, upload } : item)),
    );
  }, []);

  const add = useCallback(
    async (files: File[], alreadyChosen: number) => {
      setNotice(null);
      const room = MAX_FILES - alreadyChosen;
      const accepted: { item: UploadItem; file: File }[] = [];
      const skipped: string[] = [];

      for (const file of files) {
        const kind = file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("image/")
            ? "image"
            : null;
        if (!kind) {
          skipped.push(`${file.name} isn't a photo or a video`);
        } else if (file.size > LIMITS[kind]) {
          skipped.push(`${file.name} is over ${LIMITS[kind] / MB} MB`);
        } else if (accepted.length >= room) {
          skipped.push(
            `${file.name} is past the ${MAX_FILES} you can add at once`,
          );
        } else {
          const previewUrl = URL.createObjectURL(file);
          previews.current.add(previewUrl);
          accepted.push({
            file,
            item: {
              id: crypto.randomUUID(),
              name: file.name,
              kind,
              previewUrl,
              caption: "",
              upload: { status: "uploading", progress: 0 },
            },
          });
        }
      }

      if (skipped.length > 0) setNotice(`Left out: ${skipped.join("; ")}.`);
      if (accepted.length === 0) return;
      setItems((current) => [...current, ...accepted.map((a) => a.item)]);

      // One signature covers the whole batch.
      const ticket = await getUploadTicket();
      if (!ticket.ok) {
        accepted.forEach(({ item }) =>
          patch(item.id, { status: "error", message: ticket.message }),
        );
        return;
      }

      for (const { item, file } of accepted) {
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", ticket.apiKey);
        body.append("timestamp", String(ticket.timestamp));
        body.append("folder", ticket.folder);
        body.append("signature", ticket.signature);

        const xhr = new XMLHttpRequest();
        requests.current.set(item.id, xhr);
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${ticket.cloudName}/auto/upload`,
        );
        xhr.responseType = "json";
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            patch(item.id, {
              status: "uploading",
              progress: event.loaded / event.total,
            });
          }
        };
        xhr.onerror = () =>
          patch(item.id, {
            status: "error",
            message: "Upload interrupted. Remove it and choose the file again.",
          });
        xhr.onload = () => {
          requests.current.delete(item.id);
          const data = xhr.response as CloudinaryResponse;
          if (
            xhr.status !== 200 ||
            !data?.public_id ||
            !data.secure_url ||
            !data.width ||
            !data.height
          ) {
            patch(item.id, {
              status: "error",
              message:
                data?.error?.message ?? "Cloudinary didn't accept that file.",
            });
            return;
          }
          patch(item.id, {
            status: "done",
            media: {
              publicId: data.public_id,
              url: data.secure_url,
              type: data.resource_type === "video" ? "video" : "image",
              width: data.width,
              height: data.height,
            },
          });
        };
        xhr.send(body);
      }
    },
    [patch],
  );

  const setCaption = useCallback((id: string, caption: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, caption } : item)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    requests.current.get(id)?.abort();
    requests.current.delete(id);
    setItems((current) => {
      const gone = current.find((item) => item.id === id);
      if (gone) {
        URL.revokeObjectURL(gone.previewUrl);
        previews.current.delete(gone.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    requests.current.forEach((xhr) => xhr.abort());
    requests.current.clear();
    previews.current.forEach((url) => URL.revokeObjectURL(url));
    previews.current.clear();
    setItems([]);
    setNotice(null);
  }, []);

  return { items, notice, add, setCaption, remove, reset };
}
