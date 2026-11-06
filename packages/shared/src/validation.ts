import { isHeroSlug } from "./heroes.js";
import { isRace, type Race } from "./races.js";
import { isValidW3ChampionsUrl } from "./w3champions.js";

export interface ComboInput {
  race: string;
  heroSlug: string;
}

export interface RegistrationInput {
  tournamentName: string;
  w3ChampionsUrl: string;
  avatarHeroSlug: string;
  combo1: ComboInput;
  combo2: ComboInput;
  acceptedRules: boolean;
  acceptedConduct: boolean;
}

export type ValidationIssue = { field: string; message: string };

const NAME_RE = /^[A-Za-z0-9 _.\-]{2,24}$/;

export function validateTournamentName(name: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 24) {
    issues.push({
      field: "tournamentName",
      message: "Tournament name must be 2–24 characters.",
    });
  } else if (!NAME_RE.test(trimmed)) {
    issues.push({
      field: "tournamentName",
      message:
        "Tournament name may only contain letters, numbers, spaces, _ . -",
    });
  }
  return issues;
}

export function validateCombo(
  combo: ComboInput,
  fieldPrefix: string,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!isRace(combo.race)) {
    issues.push({ field: `${fieldPrefix}.race`, message: "Invalid race." });
  }
  if (!isHeroSlug(combo.heroSlug)) {
    issues.push({ field: `${fieldPrefix}.heroSlug`, message: "Invalid hero." });
  }
  return issues;
}

export function validateRegistration(
  input: RegistrationInput,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  issues.push(...validateTournamentName(input.tournamentName));

  if (!isValidW3ChampionsUrl(input.w3ChampionsUrl)) {
    issues.push({
      field: "w3ChampionsUrl",
      message: "Provide a valid W3Champions profile URL.",
    });
  }

  if (!isHeroSlug(input.avatarHeroSlug)) {
    issues.push({
      field: "avatarHeroSlug",
      message: "Pick a valid avatar hero.",
    });
  }

  issues.push(...validateCombo(input.combo1, "combo1"));
  issues.push(...validateCombo(input.combo2, "combo2"));

  if (!input.acceptedRules) {
    issues.push({
      field: "acceptedRules",
      message: "You must accept the tournament rules.",
    });
  }
  if (!input.acceptedConduct) {
    issues.push({
      field: "acceptedConduct",
      message: "You must accept the Code of Conduct.",
    });
  }

  return issues;
}

export function asRace(value: string): Race {
  if (!isRace(value)) throw new Error(`Invalid race: ${value}`);
  return value;
}
