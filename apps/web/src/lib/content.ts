import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma, type ContentSlug } from "@wc3dd/db";
import { CONTENT_TITLES, DEFAULT_CONTENT, type ContentSlug as SharedSlug } from "@wc3dd/shared";

function resolveDataDir(): string {
  const fromEnv = process.env.DATA_DIR?.trim();
  if (fromEnv) {
    return path.isAbsolute(fromEnv) ? fromEnv : path.resolve(process.cwd(), fromEnv);
  }
  // apps/web cwd may be apps/web or monorepo root depending on runner
  const candidates = [
    path.resolve(process.cwd(), "data"),
    path.resolve(process.cwd(), "../../data"),
  ];
  return candidates[0];
}

export function contentFilePath(slug: string): string {
  return path.join(resolveDataDir(), "content", `${slug}.md`);
}

export async function readContent(slug: SharedSlug): Promise<{ title: string; bodyMd: string }> {
  const filePath = contentFilePath(slug);
  try {
    const bodyMd = await fs.readFile(filePath, "utf8");
    return { title: CONTENT_TITLES[slug], bodyMd };
  } catch {
    const block = await prisma.contentBlock.findUnique({ where: { slug: slug as ContentSlug } });
    if (block) return { title: block.title, bodyMd: block.bodyMd };
    return { title: CONTENT_TITLES[slug], bodyMd: DEFAULT_CONTENT[slug] };
  }
}

export async function writeContent(
  slug: SharedSlug,
  bodyMd: string,
  updatedBy?: string,
): Promise<void> {
  const dir = path.join(resolveDataDir(), "content");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(contentFilePath(slug), bodyMd, "utf8");
  await prisma.contentBlock.upsert({
    where: { slug: slug as ContentSlug },
    create: {
      slug: slug as ContentSlug,
      title: CONTENT_TITLES[slug],
      bodyMd,
      updatedBy,
    },
    update: { bodyMd, title: CONTENT_TITLES[slug], updatedBy },
  });
}
