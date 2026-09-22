import { describe, expect, it } from "vitest";
import { parseMediaUrl } from "@syncspace/learning";

describe("lecture media links", () => {
  it("embeds a YouTube watch URL on the privacy player", () => {
    const media = parseMediaUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(media.kind).toBe("youtube");
    expect(media.videoId).toBe("dQw4w9WgXcQ");
    expect(media.embedUrl).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });

  it("accepts youtu.be and Vimeo, and keeps a class page as a link only", () => {
    expect(parseMediaUrl("https://youtu.be/dQw4w9WgXcQ").kind).toBe("youtube");
    expect(parseMediaUrl("https://vimeo.com/123456789").embedUrl).toBe("https://player.vimeo.com/video/123456789");
    const page = parseMediaUrl("https://learngerman.dw.com/en/nicos-weg/c-36519789");
    expect(page.kind).toBe("page");
    expect(page.embedUrl).toBeNull();
  });

  it("rejects non-https addresses", () => {
    expect(() => parseMediaUrl("http://example.com/class")).toThrow(/https/);
    expect(() => parseMediaUrl("javascript:alert(1)")).toThrow();
  });
});
