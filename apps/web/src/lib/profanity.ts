import { createRequire } from "node:module";

export type ProfanityHit = {
  term: string;
  severity: "mild" | "moderate" | "severe" | "unknown";
  categories?: string[];
};

export type ProfanityResult = {
  blocked: boolean;
  needsReview: boolean;
  matches: ProfanityHit[];
};

type ProfaneaseInstance = {
  check: (word: string) => boolean;
  clean: (word: string) => string;
  wordsList?: () => string[];
};

type ProfaneaseCtor = new (opts?: { lang?: string }) => ProfaneaseInstance;

let filter: ProfaneaseInstance | null = null;

function getFilter(): ProfaneaseInstance | null {
  if (filter) return filter;
  try {
    const require = createRequire(import.meta.url);
    const Profanease = require("profanease") as ProfaneaseCtor;
    filter = new Profanease({ lang: "en" });
  } catch {
    filter = null;
  }
  return filter;
}

/** Always hard-block these patterns (slurs / severe). */
const SEVERE_RE = [
  /\bnigg(?:a|er)s?\b/i,
  /\bfagg?ots?\b/i,
  /\bretard(?:ed|s)?\b/i,
  /\bkikes?\b/i,
  /\bspics?\b/i,
  /\bchinks?\b/i,
];

function tokenize(name: string): string[] {
  return name
    .split(/[^A-Za-z0-9]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

export function analyzeTournamentName(
  name: string,
  allowlist: Set<string> = new Set(),
): ProfanityResult {
  const text = name.trim();
  const matches: ProfanityHit[] = [];

  for (const re of SEVERE_RE) {
    const m = text.match(re);
    if (m) {
      const term = m[0].toLowerCase();
      if (!allowlist.has(term)) {
        matches.push({ term, severity: "severe", categories: ["hate"] });
      }
    }
  }

  const profanease = getFilter();
  for (const token of tokenize(text)) {
    const lower = token.toLowerCase();
    if (allowlist.has(lower)) continue;
    if (matches.some((h) => h.term === lower)) continue;

    let isProfane = false;
    if (profanease) {
      try {
        isProfane = profanease.check(token);
      } catch {
        isProfane = false;
      }
    }

    if (isProfane) {
      matches.push({ term: lower, severity: "moderate", categories: ["profanity"] });
    }
  }

  // Whole-string check catches spaced/obfuscated cases profanease may catch
  if (profanease && matches.length === 0) {
    try {
      if (profanease.check(text)) {
        matches.push({
          term: text.toLowerCase(),
          severity: "moderate",
          categories: ["profanity"],
        });
      }
    } catch {
      /* ignore */
    }
  }

  const blocked = matches.some((m) => m.severity === "severe");
  const needsReview =
    !blocked &&
    matches.some(
      (m) => m.severity === "mild" || m.severity === "moderate" || m.severity === "unknown",
    );

  return { blocked, needsReview, matches };
}
