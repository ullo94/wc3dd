export const RACES = ["HUMAN", "ORC", "UNDEAD", "NIGHT_ELF"] as const;
export type Race = (typeof RACES)[number];

export const RACE_LABELS: Record<Race, string> = {
  HUMAN: "Human",
  ORC: "Orc",
  UNDEAD: "Undead",
  NIGHT_ELF: "Night Elf",
};

/** Starting building icon slug for the race badge (w3-icons building set). */
export const RACE_STARTING_BUILDING: Record<Race, { slug: string; label: string }> = {
  HUMAN: { slug: "townhall", label: "Town Hall" },
  ORC: { slug: "greathall", label: "Great Hall" },
  UNDEAD: { slug: "necropolis", label: "Necropolis" },
  NIGHT_ELF: { slug: "treeoflife", label: "Tree of Life" },
};

export function isRace(value: string): value is Race {
  return (RACES as readonly string[]).includes(value);
}
