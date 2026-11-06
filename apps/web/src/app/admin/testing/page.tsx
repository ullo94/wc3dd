import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@wc3dd/db";
import { requireAdmin } from "@/lib/session";
import { ComboBadge } from "@/components/ComboBadge";
import { TestingPanel } from "./TestingPanel";

export const dynamic = "force-dynamic";

export default async function AdminTestingPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/api/auth/signin/discord?callbackUrl=/admin/testing");

  const season = await prisma.season.findFirst({ orderBy: { createdAt: "desc" } });
  const simPlayers = await prisma.user.findMany({
    where: { isSim: true },
    include: { combos: { orderBy: { slot: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const simMatches = await prisma.match.findMany({
    where: { isSim: true },
    include: {
      player1: true,
      player2: true,
      games: { orderBy: { gameNumber: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <>
      <div className="sim-banner">
        <strong>SIM / TESTING ONLY</strong> — actions here create <code>isSim</code> data and never
        enqueue Discord role/nickname traffic. Wipe sim data anytime without touching real
        registrations.
      </div>

      <div className="actions" style={{ marginBottom: "1rem" }}>
        <Link className="btn secondary" href="/admin">
          ← Back to admin
        </Link>
      </div>

      <h1>Admin testing</h1>

      <section className="panel">
        <h2>Season</h2>
        <p>
          {season?.name ?? "No season"} · week <strong>{season?.currentWeek ?? 0}</strong> ·{" "}
          <span style={{ textTransform: "capitalize" }}>{season?.status}</span>
        </p>
        <TestingPanel seasonId={season?.id ?? null} />
      </section>

      <section className="panel">
        <h2>Sim players ({simPlayers.length})</h2>
        {simPlayers.length === 0 ? (
          <p className="empty">No sim players yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Combos</th>
              </tr>
            </thead>
            <tbody>
              {simPlayers.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.tournamentName} <span className="badge sim">sim</span>
                  </td>
                  <td>
                    <span className={`badge ${u.status}`}>{u.status}</span>
                  </td>
                  <td>
                    <div className="actions">
                      {u.combos.map((c) => (
                        <ComboBadge key={c.id} race={c.race} heroSlug={c.heroSlug} showLabel={false} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h2>Sim matches ({simMatches.length})</h2>
        {simMatches.length === 0 ? (
          <p className="empty">No sim matches yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Players</th>
                <th>Games</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {simMatches.map((m) => (
                <tr key={m.id}>
                  <td>{m.week}</td>
                  <td>
                    {m.player1.tournamentName} vs {m.player2.tournamentName}
                  </td>
                  <td>
                    {m.games
                      .map(
                        (g) =>
                          `G${g.gameNumber}: ${g.player1Race ?? "?"} vs ${g.player2Race ?? "?"} → ${g.result ?? "—"}`,
                      )
                      .join("; ")}
                  </td>
                  <td>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
