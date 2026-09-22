import { normalizeNfcTrim } from "./normalize.js";

export type MediaRef = {
  sourceUrl: string;
  kind: "youtube" | "vimeo" | "page";
  videoId: string | null;
  embedUrl: string | null;
  label: string;
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;
const HTTPS = /^https:\/\/([^/?#]+)(\/[^?#]*)?(?:\?([^#]*))?(?:#.*)?$/i;

function queryParam(query: string, key: string): string | null {
  for (const part of query.split("&")) {
    const [rawKey, rawValue] = part.split("=");
    if (!rawKey) {
      continue;
    }
    if (decodeURIComponent(rawKey) === key) {
      return decodeURIComponent(rawValue ?? "");
    }
  }
  return null;
}

function youtube(href: string, id: string): MediaRef {
  return {
    sourceUrl: href,
    kind: "youtube",
    videoId: id,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    label: "YouTube video",
  };
}

/** Accept only https class or video links. Never embed an arbitrary page. */
export function parseMediaUrl(raw: string): MediaRef {
  const trimmed = normalizeNfcTrim(raw);
  const parsed = HTTPS.exec(trimmed);
  if (!parsed) {
    if (/^https?:\/\//i.test(trimmed) && !trimmed.toLowerCase().startsWith("https://")) {
      throw new Error("Only https links are allowed.");
    }
    throw new Error("Enter a full https address for the video or class page.");
  }
  const href = trimmed;
  const host = (parsed[1] ?? "").replace(/^www\./i, "").toLowerCase();
  const pathname = parsed[2] ?? "/";
  const query = parsed[3] ?? "";
  const parts = pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const id = parts[0] ?? "";
    if (YOUTUBE_ID.test(id)) {
      return youtube(href, id);
    }
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const fromQuery = queryParam(query, "v") ?? "";
    if (YOUTUBE_ID.test(fromQuery)) {
      return youtube(href, fromQuery);
    }
    const maybeId = parts[1] ?? "";
    if ((parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") && YOUTUBE_ID.test(maybeId)) {
      return youtube(href, maybeId);
    }
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = parts.at(-1) ?? "";
    if (VIMEO_ID.test(id)) {
      return {
        sourceUrl: href,
        kind: "vimeo",
        videoId: id,
        embedUrl: `https://player.vimeo.com/video/${id}`,
        label: "Vimeo video",
      };
    }
  }
  return {
    sourceUrl: href,
    kind: "page",
    videoId: null,
    embedUrl: null,
    label: host,
  };
}
