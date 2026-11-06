import type { NextAuthOptions, Session } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { prisma } from "@wc3dd/db";

function adminIdSet(): Set<string> {
  return new Set(
    (process.env.ADMIN_DISCORD_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "identify email guilds.join" } },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile, account }) {
      if (!account || account.provider !== "discord") return false;
      const discordId = account.providerAccountId;
      const p = profile as { username?: string; global_name?: string; image_url?: string; picture?: string } | undefined;
      const isAdmin = adminIdSet().has(discordId);
      await prisma.user.upsert({
        where: { discordId },
        create: {
          discordId,
          discordUsername: p?.username ?? p?.global_name ?? null,
          discordAvatar: p?.image_url ?? p?.picture ?? null,
          isAdmin,
        },
        update: {
          discordUsername: p?.username ?? p?.global_name ?? undefined,
          discordAvatar: p?.image_url ?? p?.picture ?? undefined,
          ...(isAdmin ? { isAdmin: true } : {}),
        },
      });
      return true;
    },
    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        token.discordId = account.providerAccountId;
      }
      if (token.discordId) {
        const user = await prisma.user.findUnique({
          where: { discordId: String(token.discordId) },
        });
        if (user) {
          token.userId = user.id;
          token.isAdmin = user.isAdmin || adminIdSet().has(user.discordId);
          token.status = user.status;
          token.tournamentName = user.tournamentName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      const s = session as Session & {
        user: Session["user"] & {
          id?: string;
          discordId?: string;
          isAdmin?: boolean;
          status?: string;
          tournamentName?: string | null;
        };
      };
      if (s.user) {
        s.user.id = token.userId as string | undefined;
        s.user.discordId = token.discordId as string | undefined;
        s.user.isAdmin = Boolean(token.isAdmin);
        s.user.status = token.status as string | undefined;
        s.user.tournamentName = (token.tournamentName as string | null) ?? null;
      }
      return s;
    },
  },
  pages: {
    signIn: "/register",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export type AppSession = Session & {
  user?: Session["user"] & {
    id?: string;
    discordId?: string;
    isAdmin?: boolean;
    status?: string;
    tournamentName?: string | null;
  };
};
