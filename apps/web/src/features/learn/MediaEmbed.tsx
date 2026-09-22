import type { LectureNote } from "@syncspace/contracts";
import { parseMediaUrl } from "@syncspace/learning";

export function MediaEmbed({ lecture }: { lecture: LectureNote }) {
  const media = parseMediaUrl(lecture.sourceUrl);
  if (media.embedUrl && (media.kind === "youtube" || media.kind === "vimeo")) {
    return (
      <div className="media-frame">
        <iframe
          src={media.embedUrl}
          title={lecture.title}
          allow="accelerometer; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  return (
    <p className="banner">
      This class page cannot be shown inside the app. Open it in a new tab, then write here.
    </p>
  );
}
