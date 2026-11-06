export const CONTENT_SLUGS = ["rules", "conduct", "maps"] as const;
export type ContentSlug = (typeof CONTENT_SLUGS)[number];

export const CONTENT_TITLES: Record<ContentSlug, string> = {
  rules: "Tournament Rules",
  conduct: "Code of Conduct",
  maps: "Map Pack / Downloads",
};

export const DEFAULT_CONTENT: Record<ContentSlug, string> = {
  rules: `# Tournament Rules

Welcome to **WC3DD** — a competitive Warcraft III Discord league.

## Match format
- Best of 3 (BO3) unless otherwise stated for playoffs.
- Standard melee, ladder settings unless the season announces otherwise.

## Winner Switch
The winner of game 1 (and game 2 if needed) must switch race for the next game of the series. Loser may keep or change.

## Hero Progression
Hero levels reset each game. No carry-over items or levels between games.

## Time limit
Each game has a soft clock at **40:00**. After 40 minutes, Sudden Death rules apply as announced for the season (typically gold/wood income pressure or judge call).

## Sudden Death
If a game reaches the time limit without a clear winner, Sudden Death begins. Follow the season sheet for exact Sudden Death mechanics.

## Reporting
Report results on the website after the series. Upload replays when the archive feature is enabled.

## Scheduling
Agree on a time within the round deadline. Sunday reserve slot is available for catch-up when announced.
`,
  conduct: `# Code of Conduct

WC3DD is a respectful competitive community.

## Be excellent
- No harassment, hate speech, or discrimination.
- No cheating, account sharing for ranked matches, or map hacks.
- Argue the play, not the person.

## Discord
- Keep channels on-topic.
- Follow Discord staff and tournament admin instructions.
- Do not spam pings or DMs for match reminders beyond the agreed process.

## Reporting issues
Use the private report flow (or contact an admin) for Code of Conduct concerns. Retaliation is itself a CoC violation.

## Penalties
Admins may issue warnings, match forfeits, suspensions, or bans depending on severity.
`,
  maps: `# Downloads

## Map pack
Season map pack hosting will appear here. Until then, use the official Warcraft III Reforged melee map pool unless the season sheet lists substitutes.

## Replays
Replay archive upload lands in a later milestone. Keep your \`.w3g\` files until then.

## Client
Warcraft III Reforged (latest patch) is required unless a season announces a locked build.
`,
};