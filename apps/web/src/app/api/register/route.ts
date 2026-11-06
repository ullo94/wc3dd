import { NextResponse } from "next/server";
import { prisma, type Race } from "@wc3dd/db";
import { validateRegistration, normalizeW3ChampionsUrl } from "@wc3dd/shared";
import { requireUser } from "@/lib/session";
import { analyzeTournamentName } from "@/lib/profanity";

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in with Discord first." }, { status: 401 });
  }

  const body = (await req.json()) as {
    tournamentName?: string;
    w3ChampionsUrl?: string;
    avatarHeroSlug?: string;
    combo1?: { race?: string; heroSlug?: string };
    combo2?: { race?: string; heroSlug?: string };
    acceptedRules?: boolean;
    acceptedConduct?: boolean;
  };

  const input = {
    tournamentName: body.tournamentName?.trim() ?? "",
    w3ChampionsUrl: body.w3ChampionsUrl?.trim() ?? "",
    avatarHeroSlug: body.avatarHeroSlug ?? "",
    combo1: {
      race: body.combo1?.race ?? "",
      heroSlug: body.combo1?.heroSlug ?? "",
    },
    combo2: {
      race: body.combo2?.race ?? "",
      heroSlug: body.combo2?.heroSlug ?? "",
    },
    acceptedRules: Boolean(body.acceptedRules),
    acceptedConduct: Boolean(body.acceptedConduct),
  };

  const issues = validateRegistration(input);
  if (issues.length) {
    return NextResponse.json({ error: issues[0]?.message ?? "Invalid form." }, { status: 400 });
  }

  const allowRows = await prisma.profanityAllowlist.findMany();
  const allowlist = new Set(allowRows.map((r) => r.term.toLowerCase()));
  const profanity = analyzeTournamentName(input.tournamentName, allowlist);

  if (profanity.blocked) {
    return NextResponse.json(
      {
        error:
          "That tournament name contains language we cannot accept. Please choose another name.",
      },
      { status: 400 },
    );
  }

  let w3Url: string;
  try {
    w3Url = normalizeW3ChampionsUrl(input.w3ChampionsUrl);
  } catch {
    return NextResponse.json({ error: "Invalid W3Champions URL." }, { status: 400 });
  }

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        tournamentName: input.tournamentName.trim(),
        w3ChampionsUrl: w3Url,
        avatarHeroSlug: input.avatarHeroSlug,
        status: "pending",
        needsProfanityReview: profanity.needsReview,
        profanityMatches: profanity.matches,
        acceptedRulesAt: now,
        acceptedConductAt: now,
        rejectionReason: null,
      },
    });

    await tx.playerCombo.deleteMany({ where: { userId: user.id } });
    await tx.playerCombo.createMany({
      data: [
        {
          userId: user.id,
          slot: 1,
          race: input.combo1.race as Race,
          heroSlug: input.combo1.heroSlug,
        },
        {
          userId: user.id,
          slot: 2,
          race: input.combo2.race as Race,
          heroSlug: input.combo2.heroSlug,
        },
      ],
    });
  });

  return NextResponse.json({
    message: profanity.needsReview
      ? "Registration submitted. Your name was flagged for admin review."
      : "Registration submitted — pending admin approval.",
  });
}
