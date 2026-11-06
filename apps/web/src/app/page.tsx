import Link from "next/link";
import { prisma } from "@wc3dd/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const season = await prisma.season.findFirst({
    where: { status: { in: ["registration", "active", "playoffs"] } },
    orderBy: { createdAt: "desc" },
  });

  const registeredCount = await prisma.user.count({
    where: { status: "approved", isSim: false },
  });
  const pendingCount = await prisma.user.count({
    where: { status: "pending", isSim: false },
  });

  const registrationOpen = season?.registrationOpen ?? false;
  const invite = process.env.DISCORD_INVITE_URL ?? "#";

  return (
    <>
      <section className="hero">
        <p className="badge open" style={{ marginBottom: "1rem" }}>
          {registrationOpen ? "Registration open" : "Registration closed"}
        </p>
        <h1>WC3DD</h1>
        <p>
          Competitive Warcraft III Discord league — Winner Switch, Hero Progression,
          40:00 Sudden Death. Register with Discord, get approved, and play Swiss.
        </p>
        <div className="hero-actions">
          <Link className="btn" href="/register">
            Register
          </Link>
          <Link className="btn secondary" href="/rules">
            Read the rules
          </Link>
          <a className="btn secondary" href={invite} target="_blank" rel="noreferrer">
            Join Discord
          </a>
        </div>
      </section>

      <div className="stat-row">
        <div className="stat">
          <div className="label">Season</div>
          <div className="value">{season?.name ?? "TBD"}</div>
        </div>
        <div className="stat">
          <div className="label">Status</div>
          <div className="value" style={{ textTransform: "capitalize" }}>
            {season?.status ?? "—"}
          </div>
        </div>
        <div className="stat">
          <div className="label">Week</div>
          <div className="value">{season?.currentWeek ?? 0}</div>
        </div>
        <div className="stat">
          <div className="label">Approved</div>
          <div className="value">{registeredCount}</div>
        </div>
        <div className="stat">
          <div className="label">Pending</div>
          <div className="value">{pendingCount}</div>
        </div>
        <div className="stat">
          <div className="label">Next deadline</div>
          <div className="value" style={{ fontSize: "1.05rem" }}>
            {season?.nextDeadline
              ? new Date(season.nextDeadline).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </div>
        </div>
      </div>

      <section className="panel">
        <h2>Latest results</h2>
        <p className="empty">
          Match reporting lands in a later milestone. Standings and results will show here.
        </p>
        <div className="actions">
          <Link className="btn secondary" href="/standings">
            Standings
          </Link>
          <Link className="btn secondary" href="/stats">
            Stats
          </Link>
          <Link className="btn secondary" href="/replays">
            Replay archive
          </Link>
        </div>
      </section>
    </>
  );
}
