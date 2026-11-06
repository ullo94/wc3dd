"use client";

import { useState } from "react";
import { HEROES, RACES, RACE_LABELS, type Race } from "@wc3dd/shared";
import { ComboBadge } from "@/components/ComboBadge";

type Props = {
  discordUsername?: string | null;
  initial?: {
    tournamentName?: string | null;
    w3ChampionsUrl?: string | null;
    avatarHeroSlug?: string | null;
    combo1Race?: string;
    combo1Hero?: string;
    combo2Race?: string;
    combo2Hero?: string;
    status?: string;
  };
};

export function RegisterForm({ discordUsername, initial }: Props) {
  const [tournamentName, setTournamentName] = useState(initial?.tournamentName ?? "");
  const [w3ChampionsUrl, setW3ChampionsUrl] = useState(initial?.w3ChampionsUrl ?? "");
  const [avatarHeroSlug, setAvatarHeroSlug] = useState(initial?.avatarHeroSlug ?? "archmage");
  const [combo1Race, setCombo1Race] = useState<Race>((initial?.combo1Race as Race) ?? "HUMAN");
  const [combo1Hero, setCombo1Hero] = useState(initial?.combo1Hero ?? "archmage");
  const [combo2Race, setCombo2Race] = useState<Race>((initial?.combo2Race as Race) ?? "ORC");
  const [combo2Hero, setCombo2Hero] = useState(initial?.combo2Hero ?? "blademaster");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [acceptedConduct, setAcceptedConduct] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setPending(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentName,
          w3ChampionsUrl,
          avatarHeroSlug,
          combo1: { race: combo1Race, heroSlug: combo1Hero },
          combo2: { race: combo2Race, heroSlug: combo2Hero },
          acceptedRules,
          acceptedConduct,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      setOk(data.message ?? "Registration submitted — pending admin approval.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  const heroesFor = (race: Race) =>
    HEROES.filter((h) => h.race === race || h.kind === "tavern");

  return (
    <form className="panel form-grid" onSubmit={onSubmit}>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        Signed in as <strong>{discordUsername ?? "Discord user"}</strong>
        {initial?.status ? (
          <>
            {" "}
            · status <span className={`badge ${initial.status}`}>{initial.status}</span>
          </>
        ) : null}
      </p>

      <label>
        Tournament name
        <input
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          maxLength={24}
          required
          placeholder="Your league name"
        />
      </label>

      <label>
        W3Champions profile URL
        <input
          value={w3ChampionsUrl}
          onChange={(e) => setW3ChampionsUrl(e.target.value)}
          required
          placeholder="https://w3champions.com/player/Name%232123"
        />
      </label>

      <label>
        Avatar hero
        <select value={avatarHeroSlug} onChange={(e) => setAvatarHeroSlug(e.target.value)}>
          {HEROES.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "1rem" }}>
        <legend>Combo 1</legend>
        <div className="form-grid">
          <label>
            Race
            <select
              value={combo1Race}
              onChange={(e) => {
                const r = e.target.value as Race;
                setCombo1Race(r);
                const first = heroesFor(r)[0];
                if (first) setCombo1Hero(first.slug);
              }}
            >
              {RACES.map((r) => (
                <option key={r} value={r}>
                  {RACE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hero
            <select value={combo1Hero} onChange={(e) => setCombo1Hero(e.target.value)}>
              {heroesFor(combo1Race).map((h) => (
                <option key={h.slug} value={h.slug}>
                  {h.name}
                  {h.kind === "tavern" ? " (Tavern)" : ""}
                </option>
              ))}
            </select>
          </label>
          <ComboBadge race={combo1Race} heroSlug={combo1Hero} />
        </div>
      </fieldset>

      <fieldset style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "1rem" }}>
        <legend>Combo 2</legend>
        <div className="form-grid">
          <label>
            Race
            <select
              value={combo2Race}
              onChange={(e) => {
                const r = e.target.value as Race;
                setCombo2Race(r);
                const first = heroesFor(r)[0];
                if (first) setCombo2Hero(first.slug);
              }}
            >
              {RACES.map((r) => (
                <option key={r} value={r}>
                  {RACE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hero
            <select value={combo2Hero} onChange={(e) => setCombo2Hero(e.target.value)}>
              {heroesFor(combo2Race).map((h) => (
                <option key={h.slug} value={h.slug}>
                  {h.name}
                  {h.kind === "tavern" ? " (Tavern)" : ""}
                </option>
              ))}
            </select>
          </label>
          <ComboBadge race={combo2Race} heroSlug={combo2Hero} />
        </div>
      </fieldset>

      <label className="check">
        <input
          type="checkbox"
          checked={acceptedRules}
          onChange={(e) => setAcceptedRules(e.target.checked)}
        />
        <span>
          I have read and accept the <a href="/rules">tournament rules</a>.
        </span>
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={acceptedConduct}
          onChange={(e) => setAcceptedConduct(e.target.checked)}
        />
        <span>
          I have read and accept the <a href="/conduct">Code of Conduct</a>.
        </span>
      </label>

      {error ? <p className="error">{error}</p> : null}
      {ok ? <p className="success">{ok}</p> : null}

      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit registration"}
      </button>
    </form>
  );
}
