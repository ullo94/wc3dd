const W3C_PROFILE =
  /^https?:\/\/(www\.)?w3champions\.com\/player\/[^/\s]+/i;
const W3C_PROFILE_ALT =
  /^https?:\/\/(www\.)?w3champions\.com\/[^/\s]+/i;

export function isValidW3ChampionsUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    if (!/^https?:$/.test(u.protocol)) return false;
    if (!/(^|\.)w3champions\.com$/i.test(u.hostname)) return false;
    return u.pathname.length > 1;
  } catch {
    return false;
  }
}

export function normalizeW3ChampionsUrl(url: string): string {
  const trimmed = url.trim();
  if (!isValidW3ChampionsUrl(trimmed)) {
    throw new Error("Invalid W3Champions URL");
  }
  const u = new URL(trimmed);
  u.hash = "";
  return u.toString().replace(/\/$/, "");
}

export function w3ChampionsProfileHint(): string {
  return "https://w3champions.com/player/YourBattleTag";
}

export { W3C_PROFILE, W3C_PROFILE_ALT };
