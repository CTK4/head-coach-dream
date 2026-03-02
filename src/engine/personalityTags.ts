export function parsePersonalityTags(raw: unknown): string[] {
  if (typeof raw !== "string") return [];

  const tags = raw
    .split(/[;,]/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(tags));
}

