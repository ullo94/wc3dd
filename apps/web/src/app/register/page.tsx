import Link from "next/link";
import { getSession, requireUser } from "@/lib/session";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getSession();
  if (!session?.user) {
    return (
      <section className="panel">
        <h1>Register</h1>
        <p>Sign in with Discord to register for WC3DD.</p>
        <Link className="btn" href="/api/auth/signin/discord?callbackUrl=/register">
          Continue with Discord
        </Link>
      </section>
    );
  }

  const user = await requireUser();
  const c1 = user?.combos.find((c) => c.slot === 1);
  const c2 = user?.combos.find((c) => c.slot === 2);

  return (
    <>
      <h1>Register</h1>
      <p style={{ color: "var(--muted)" }}>
        Submissions stay pending until an admin approves. Severe profanity is blocked;
        milder hits are flagged for admin review.
      </p>
      <RegisterForm
        discordUsername={user?.discordUsername ?? session.user.name}
        initial={{
          tournamentName: user?.tournamentName,
          w3ChampionsUrl: user?.w3ChampionsUrl,
          avatarHeroSlug: user?.avatarHeroSlug,
          combo1Race: c1?.race,
          combo1Hero: c1?.heroSlug,
          combo2Race: c2?.race,
          combo2Hero: c2?.heroSlug,
          status: user?.status,
        }}
      />
      <p style={{ marginTop: "1rem" }}>
        <Link href="/api/auth/signout">Sign out</Link>
      </p>
    </>
  );
}
