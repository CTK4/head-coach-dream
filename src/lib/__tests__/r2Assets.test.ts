import { describe, expect, it, vi } from "vitest";
import { buildAvatarCandidates, getInitials, joinUrl } from "@/lib/r2Assets";

describe("joinUrl", () => {
  it("joins URL and path with a single slash", () => {
    expect(joinUrl("https://example.com/avatars/", "/123.jpg")).toBe(
      "https://example.com/avatars/123.jpg",
    );
    expect(joinUrl("https://example.com/avatars", "123.jpg")).toBe(
      "https://example.com/avatars/123.jpg",
    );
  });

  it("returns base or path when one side is empty", () => {
    expect(joinUrl("", "/avatars/1.jpg")).toBe("avatars/1.jpg");
    expect(joinUrl("https://example.com/a/", "")).toBe("https://example.com/a");
  });
});

describe("buildAvatarCandidates", () => {
  it("returns R2 candidates first, then local fallbacks", () => {
    vi.stubEnv("VITE_R2_AVATARS_BASE_URL", "https://cdn.example.com/avatars");
    const candidates = buildAvatarCandidates("player-1");
    expect(candidates).toEqual([
      "https://cdn.example.com/avatars/player-1.jpg",
      "https://cdn.example.com/avatars/player-1.png",
      "https://cdn.example.com/avatars/player-1.webp",
      "/avatars/player-1.jpg",
      "/avatars/player-1.png",
      "/avatars/player-1.webp",
    ]);
    vi.unstubAllEnvs();
  });
});

describe("getInitials", () => {
  it("returns initials from first two words", () => {
    expect(getInitials("John Doe Smith")).toBe("JD");
  });

  it("uses fallback for empty names", () => {
    expect(getInitials("", "NA")).toBe("NA");
    expect(getInitials(undefined, "NA")).toBe("NA");
  });
});
