import type { Race } from "./races.js";

const W3_ICONS_BASE =
  "https://cdn.jsdelivr.net/gh/aaronjewell/w3-icons@main/images";

/**
 * aaronjewell/w3-icons currently ships orc + neutral (+ common) only.
 * Map our slugs → repo-relative paths where files exist; otherwise null
 * (UI falls back to local /icons placeholders).
 */
const HERO_REMOTE: Record<string, string> = {
  // Orc
  blademaster: "orc/blademaster.png",
  farseer: "orc/farseer.png",
  taurenchieftain: "orc/chieftain.png",
  shadowhunter: "orc/shadowhunter.png",
  // Tavern / neutral
  alchemist: "neutral/goblinalchemist.gif",
  darkranger: "neutral/darkranger.gif",
  beastmaster: "neutral/beastmaster.gif",
  pitlord: "neutral/pitlord.gif",
  tinker: "neutral/goblintinker.gif",
  firelord: "neutral/firelord.jpg",
  pandarenbrewmaster: "neutral/pandarenbrewmaster.gif",
  nagaseawitch: "neutral/nagaseawitch.gif",
};

const BUILDING_REMOTE: Record<Race, string | null> = {
  HUMAN: null, // town hall not in upstream yet
  ORC: "orc/greathall.png",
  UNDEAD: null,
  NIGHT_ELF: null,
};

export function heroIconUrl(slug: string): string {
  const remote = HERO_REMOTE[slug];
  if (remote) return `${W3_ICONS_BASE}/${remote}`;
  return `/icons/heroes/${slug}.svg`;
}

export function buildingIconUrl(slug: string): string {
  // slug here is starting-building slug from RACE_STARTING_BUILDING
  const raceByBuilding: Record<string, Race> = {
    townhall: "HUMAN",
    greathall: "ORC",
    necropolis: "UNDEAD",
    treeoflife: "NIGHT_ELF",
  };
  const race = raceByBuilding[slug];
  if (race) {
    const remote = BUILDING_REMOTE[race];
    if (remote) return `${W3_ICONS_BASE}/${remote}`;
  }
  return `/icons/buildings/${slug}.svg`;
}

export { W3_ICONS_BASE, HERO_REMOTE, BUILDING_REMOTE };
