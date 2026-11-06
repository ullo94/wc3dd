import type { Race } from "./races.js";

export type HeroKind = "standard" | "tavern";

export interface HeroDef {
  slug: string;
  name: string;
  race: Race | "TAVERN";
  kind: HeroKind;
}

/** Standard + tavern heroes aligned with aaronjewell/w3-icons naming. */
export const HEROES: HeroDef[] = [
  // Human
  { slug: "archmage", name: "Archmage", race: "HUMAN", kind: "standard" },
  { slug: "mountainking", name: "Mountain King", race: "HUMAN", kind: "standard" },
  { slug: "paladin", name: "Paladin", race: "HUMAN", kind: "standard" },
  { slug: "bloodmage", name: "Blood Mage", race: "HUMAN", kind: "standard" },
  // Orc
  { slug: "blademaster", name: "Blademaster", race: "ORC", kind: "standard" },
  { slug: "farseer", name: "Far Seer", race: "ORC", kind: "standard" },
  { slug: "taurenchieftain", name: "Tauren Chieftain", race: "ORC", kind: "standard" },
  { slug: "shadowhunter", name: "Shadow Hunter", race: "ORC", kind: "standard" },
  // Undead
  { slug: "deathknight", name: "Death Knight", race: "UNDEAD", kind: "standard" },
  { slug: "lich", name: "Lich", race: "UNDEAD", kind: "standard" },
  { slug: "dreadlord", name: "Dread Lord", race: "UNDEAD", kind: "standard" },
  { slug: "cryptlord", name: "Crypt Lord", race: "UNDEAD", kind: "standard" },
  // Night Elf
  { slug: "demonhunter", name: "Demon Hunter", race: "NIGHT_ELF", kind: "standard" },
  { slug: "keeperofthegrove", name: "Keeper of the Grove", race: "NIGHT_ELF", kind: "standard" },
  { slug: "priestessofthemoon", name: "Priestess of the Moon", race: "NIGHT_ELF", kind: "standard" },
  { slug: "warden", name: "Warden", race: "NIGHT_ELF", kind: "standard" },
  // Tavern
  { slug: "alchemist", name: "Goblin Alchemist", race: "TAVERN", kind: "tavern" },
  { slug: "darkranger", name: "Dark Ranger", race: "TAVERN", kind: "tavern" },
  { slug: "beastmaster", name: "Beastmaster", race: "TAVERN", kind: "tavern" },
  { slug: "pitlord", name: "Pit Lord", race: "TAVERN", kind: "tavern" },
  { slug: "tinker", name: "Goblin Tinker", race: "TAVERN", kind: "tavern" },
  { slug: "firelord", name: "Firelord", race: "TAVERN", kind: "tavern" },
  { slug: "pandarenbrewmaster", name: "Pandaren Brewmaster", race: "TAVERN", kind: "tavern" },
  { slug: "nagaseawitch", name: "Naga Sea Witch", race: "TAVERN", kind: "tavern" },
];

export const HERO_BY_SLUG: Record<string, HeroDef> = Object.fromEntries(
  HEROES.map((h) => [h.slug, h]),
);

export function heroesForRace(race: Race): HeroDef[] {
  return HEROES.filter((h) => h.race === race || h.kind === "tavern");
}

export function isHeroSlug(value: string): boolean {
  return value in HERO_BY_SLUG;
}

export { heroIconUrl, buildingIconUrl } from "./icons.js";
