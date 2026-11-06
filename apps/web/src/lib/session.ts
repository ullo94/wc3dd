import { getServerSession } from "next-auth";
import { authOptions, type AppSession } from "./auth";
import { prisma } from "@wc3dd/db";

export async function getSession(): Promise<AppSession | null> {
  return (await getServerSession(authOptions)) as AppSession | null;
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.discordId) return null;
  const user = await prisma.user.findUnique({
    where: { discordId: session.user.discordId },
    include: { combos: { orderBy: { slot: "asc" } } },
  });
  return user;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user?.discordId) return null;
  const adminIds = new Set(
    (process.env.ADMIN_DISCORD_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const user = await prisma.user.findUnique({
    where: { discordId: session.user.discordId },
  });
  if (!user) return null;
  if (user.isAdmin || adminIds.has(user.discordId)) return user;
  return null;
}
