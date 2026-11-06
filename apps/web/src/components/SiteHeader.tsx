import Link from "next/link";
import { getSession } from "@/lib/session";

export async function SiteHeader() {
  const session = await getSession();
  const invite = process.env.DISCORD_INVITE_URL ?? "#";

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          WC3<span>DD</span>
        </Link>
        <nav className="nav">
          <Link href="/rules">Rules</Link>
          <Link href="/conduct">Code of Conduct</Link>
          <Link href="/downloads">Downloads</Link>
          <Link href="/standings">Standings</Link>
          <Link href="/register">Register</Link>
          <a href={invite} target="_blank" rel="noreferrer">
            Discord
          </a>
          {session?.user?.isAdmin ? <Link href="/admin">Admin</Link> : null}
          {session?.user ? (
            <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              {session.user.tournamentName || session.user.name || "Signed in"}
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
