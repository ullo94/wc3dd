import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, ContentSlug } from "@prisma/client";
import { CONTENT_TITLES, DEFAULT_CONTENT } from "@wc3dd/shared";

const prisma = new PrismaClient();

function dataDir(): string {
  const fromEnv = process.env.DATA_DIR?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv);
  }
  // Prefer monorepo root when seeding from packages/db
  const root = path.resolve(process.cwd(), process.cwd().endsWith("packages/db") ? "../.." : ".");
  return path.join(root, "data");
}

async function seedContentFiles() {
  const contentDir = path.join(dataDir(), "content");
  await mkdir(contentDir, { recursive: true });
  await mkdir(path.join(dataDir(), "replays"), { recursive: true });
  await mkdir(path.join(dataDir(), "maps"), { recursive: true });

  for (const slug of Object.keys(DEFAULT_CONTENT) as (keyof typeof DEFAULT_CONTENT)[]) {
    const filePath = path.join(contentDir, `${slug}.md`);
    await writeFile(filePath, DEFAULT_CONTENT[slug], "utf8");
  }
}

async function main() {
  await seedContentFiles();

  for (const slug of Object.keys(DEFAULT_CONTENT) as ContentSlug[]) {
    await prisma.contentBlock.upsert({
      where: { slug },
      create: {
        slug,
        title: CONTENT_TITLES[slug],
        bodyMd: DEFAULT_CONTENT[slug],
      },
      update: {
        title: CONTENT_TITLES[slug],
        bodyMd: DEFAULT_CONTENT[slug],
      },
    });
  }

  const season = await prisma.season.findFirst({
    where: { status: { in: ["registration", "active"] } },
  });

  if (!season) {
    await prisma.season.create({
      data: {
        name: "WC3DD Season 1",
        status: "registration",
        currentWeek: 0,
        registrationOpen: true,
        nextDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const adminIds = (process.env.ADMIN_DISCORD_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const discordId of adminIds) {
    await prisma.user.upsert({
      where: { discordId },
      create: {
        discordId,
        tournamentName: `Admin-${discordId.slice(-4)}`,
        status: "approved",
        isAdmin: true,
        avatarHeroSlug: "archmage",
      },
      update: { isAdmin: true },
    });
  }

  console.log("Seed complete.");
  console.log(`  Content files → ${path.join(dataDir(), "content")}`);
  console.log(`  Admin IDs seeded: ${adminIds.length || "(none — set ADMIN_DISCORD_IDS)"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
