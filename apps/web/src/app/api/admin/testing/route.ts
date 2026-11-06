import { NextResponse } from "next/server";
import { prisma, type Race, type UserStatus } from "@wc3dd/db";
import { HEROES, RACES } from "@wc3dd/shared";
import { requireAdmin } from "@/lib/session";

const MAPS = [
  "Echo Isles",
  "Terenas Stand",
  "Twisted Meadows",
  "Ancient Isles",
  "Northern Isles",
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomCombo() {
  const race = pick(RACES);
  const heroes = HEROES.filter((h) => h.race === race || h.kind === "tavern");
  return { race, heroSlug: pick(heroes).slug };
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = (await req.json()) as {
    action?: string;
    count?: number;
    userId?: string;
    status?: UserStatus;
    seasonId?: string;
  };

  switch (body.action) {
    case "seed_players": {
      const count = Math.min(Math.max(body.count ?? 4, 1), 32);
      const created = [];
      for (let i = 0; i < count; i++) {
        const c1 = randomCombo();
        const c2 = randomCombo();
        const n = Date.now().toString(36).slice(-4) + i;
        const user = await prisma.user.create({
          data: {
            discordId: `sim-${n}-${Math.random().toString(36).slice(2, 8)}`,
            discordUsername: `sim_user_${n}`,
            tournamentName: `SimPlayer${n}`,
            avatarHeroSlug: c1.heroSlug,
            w3ChampionsUrl: `https://w3champions.com/player/SimPlayer${n}%231`,
            status: "approved",
            isSim: true,
            source: "sim",
            acceptedRulesAt: new Date(),
            acceptedConductAt: new Date(),
            combos: {
              create: [
                { slot: 1, race: c1.race as Race, heroSlug: c1.heroSlug },
                { slot: 2, race: c2.race as Race, heroSlug: c2.heroSlug },
              ],
            },
          },
        });
        created.push(user.tournamentName);
      }
      await prisma.adminAudit.create({
        data: {
          adminId: admin.id,
          action: "sim_seed_players",
          detail: { count, names: created },
        },
      });
      return NextResponse.json({
        message: `Created ${created.length} sim players: ${created.join(", ")}`,
      });
    }

    case "set_status": {
      if (!body.userId || !body.status) {
        return NextResponse.json({ error: "userId and status required." }, { status: 400 });
      }
      const user = await prisma.user.findUnique({ where: { id: body.userId } });
      if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { status: body.status },
      });
      return NextResponse.json({
        message: `Set ${user.tournamentName ?? user.id} → ${body.status}`,
      });
    }

    case "create_bo3": {
      if (!body.seasonId) {
        return NextResponse.json({ error: "seasonId required." }, { status: 400 });
      }
      const season = await prisma.season.findUnique({ where: { id: body.seasonId } });
      if (!season) {
        return NextResponse.json({ error: "Season not found." }, { status: 404 });
      }
      const players = await prisma.user.findMany({
        where: { isSim: true, status: "approved" },
        take: 40,
      });
      if (players.length < 2) {
        return NextResponse.json(
          { error: "Need at least 2 approved sim players." },
          { status: 400 },
        );
      }
      const shuffled = [...players].sort(() => Math.random() - 0.5);
      const p1 = shuffled[0]!;
      const p2 = shuffled[1]!;
      const c1 = randomCombo();
      const c2 = randomCombo();
      const c3a = randomCombo();
      const c3b = randomCombo();

      const match = await prisma.match.create({
        data: {
          seasonId: season.id,
          week: season.currentWeek || 1,
          player1Id: p1.id,
          player2Id: p2.id,
          status: "confirmed",
          bestOf: 3,
          isSim: true,
          source: "sim",
          reportedAt: new Date(),
          games: {
            create: [
              {
                gameNumber: 1,
                mapName: pick(MAPS),
                player1Race: c1.race as Race,
                player2Race: c2.race as Race,
                player1Hero: c1.heroSlug,
                player2Hero: c2.heroSlug,
                result: "player1_win",
                durationSec: 1200 + Math.floor(Math.random() * 900),
              },
              {
                gameNumber: 2,
                mapName: pick(MAPS),
                player1Race: c2.race as Race,
                player2Race: c1.race as Race,
                player1Hero: c2.heroSlug,
                player2Hero: c1.heroSlug,
                result: "player2_win",
                durationSec: 1100 + Math.floor(Math.random() * 900),
              },
              {
                gameNumber: 3,
                mapName: pick(MAPS),
                player1Race: c3a.race as Race,
                player2Race: c3b.race as Race,
                player1Hero: c3a.heroSlug,
                player2Hero: c3b.heroSlug,
                result: Math.random() > 0.5 ? "player1_win" : "player2_win",
                durationSec: 1400 + Math.floor(Math.random() * 800),
              },
            ],
          },
        },
      });

      return NextResponse.json({
        message: `Created sim BO3 ${p1.tournamentName} vs ${p2.tournamentName} (${match.id})`,
      });
    }

    case "advance_week": {
      if (!body.seasonId) {
        return NextResponse.json({ error: "seasonId required." }, { status: 400 });
      }
      const season = await prisma.season.update({
        where: { id: body.seasonId },
        data: {
          currentWeek: { increment: 1 },
          status: "active",
          nextDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return NextResponse.json({
        message: `Advanced to week ${season.currentWeek}`,
      });
    }

    case "wipe_sim": {
      await prisma.$transaction(async (tx) => {
        await tx.game.deleteMany({ where: { match: { isSim: true } } });
        await tx.match.deleteMany({ where: { isSim: true } });
        await tx.playerCombo.deleteMany({ where: { user: { isSim: true } } });
        await tx.standing.deleteMany({ where: { user: { isSim: true } } });
        await tx.discordAction.deleteMany({ where: { user: { isSim: true } } });
        await tx.user.deleteMany({ where: { isSim: true } });
      });
      await prisma.adminAudit.create({
        data: { adminId: admin.id, action: "sim_wipe" },
      });
      return NextResponse.json({ message: "All sim players and matches wiped." });
    }

    default:
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
}
