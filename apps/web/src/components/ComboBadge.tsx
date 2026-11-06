import {
  HERO_BY_SLUG,
  RACE_LABELS,
  RACE_STARTING_BUILDING,
  buildingIconUrl,
  heroIconUrl,
  type Race,
} from "@wc3dd/shared";

export function ComboBadge({
  race,
  heroSlug,
  showLabel = true,
}: {
  race: Race | string;
  heroSlug: string;
  showLabel?: boolean;
}) {
  const raceKey = race as Race;
  const building = RACE_STARTING_BUILDING[raceKey];
  const hero = HERO_BY_SLUG[heroSlug];
  const raceLabel = RACE_LABELS[raceKey] ?? String(race);

  return (
    <span className="combo" title={`${hero?.name ?? heroSlug} (${raceLabel})`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="combo-hero"
        src={heroIconUrl(heroSlug)}
        alt={hero?.name ?? heroSlug}
        width={48}
        height={48}
        onError={(e) => {
          (e.target as HTMLImageElement).style.opacity = "0.35";
        }}
      />
      {building ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="combo-building"
          src={buildingIconUrl(building.slug)}
          alt={building.label}
          width={22}
          height={22}
          title={building.label}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      {showLabel ? (
        <span className="combo-label">
          {hero?.name ?? heroSlug} · {raceLabel}
        </span>
      ) : null}
    </span>
  );
}
