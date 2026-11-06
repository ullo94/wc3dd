import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@wc3dd/db";
import { requireAdmin } from "@/lib/session";
import { ComboBadge } from "@/components/ComboBadge";
import { ApprovalButtons } from "./ApprovalButtons";
import { ContentEditor } from "./ContentEditor";
import { readContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/api/auth/signin/discord?callbackUrl=/admin");

  const pending = await prisma.user.findMany({
    where: { status: "pending" },
    include: { combos: { orderBy: { slot: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  const rules = await readContent("rules");
  const conduct = await readContent("conduct");
  const maps = await readContent("maps");

  return (
    <>
      <h1>Admin</h1>
      <div className="actions" style={{ marginBottom: "1.25rem" }}>
        <Link className="btn secondary" href="/admin/testing">
          Testing / sim tools
        </Link>
      </div>

      <section className="panel">
        <h2>Pending registrations ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="empty">No pending registrations.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Discord</th>
                <th>Combos</th>
                <th>Flags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.tournamentName}</strong>
                    {u.isSim ? <span className="badge sim">sim</span> : null}
                    <div style={{ fontSize: "0.8rem" }}>
                      {u.w3ChampionsUrl ? (
                        <a href={u.w3ChampionsUrl} target="_blank" rel="noreferrer">
                          W3C
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    {u.discordUsername}
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{u.discordId}</div>
                  </td>
                  <td>
                    <div className="actions">
                      {u.combos.map((c) => (
                        <ComboBadge key={c.id} race={c.race} heroSlug={c.heroSlug} showLabel={false} />
                      ))}
                    </div>
                  </td>
                  <td>
                    {u.needsProfanityReview ? (
                      <div>
                        <span className="badge pending">profanity review</span>
                        <pre style={{ fontSize: "0.7rem", whiteSpace: "pre-wrap" }}>
                          {JSON.stringify(u.profanityMatches, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <ApprovalButtons userId={u.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h2>Content editors</h2>
        <p style={{ color: "var(--muted)" }}>
          Saving updates both the admin DB cache and Markdown files under <code>DATA_DIR/content/</code>.
        </p>
        <ContentEditor slug="rules" title="Rules" initial={rules.bodyMd} />
        <ContentEditor slug="conduct" title="Code of Conduct" initial={conduct.bodyMd} />
        <ContentEditor slug="maps" title="Downloads / maps" initial={maps.bodyMd} />
      </section>
    </>
  );
}
