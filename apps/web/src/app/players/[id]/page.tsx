import { notFound } from "next/navigation";
import { prisma } from "@wc3dd/db";
import { ComboBadge } from "@/components/ComboBadge";

export const dynamic = "force-dynamic";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { combos: { orderBy: { slot: "asc" } } },
  });
  if (!user || user.status !== "approved") notFound();

  return (
    <section className="panel">
      <h1>{user.tournamentName ?? "Player"}</h1>
      <p style={{ color: "var(--muted)" }}>
        {user.w3ChampionsUrl ? (
          <a href={user.w3ChampionsUrl} target="_blank" rel="noreferrer">
            W3Champions profile
          </a>
        ) : (
          "No W3Champions link"
        )}
      </p>
      <h2>Combos</h2>
      <div className="actions" style={{ marginTop: "1rem" }}>
        {user.combos.map((c) => (
          <ComboBadge key={c.id} race={c.race} heroSlug={c.heroSlug} />
        ))}
      </div>
      <p className="empty">Match history and stats placeholders for later milestones.</p>
    </section>
  );
}
