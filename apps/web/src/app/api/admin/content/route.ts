import { NextResponse } from "next/server";
import { CONTENT_SLUGS, type ContentSlug } from "@wc3dd/shared";
import { requireAdmin } from "@/lib/session";
import { writeContent } from "@/lib/content";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = (await req.json()) as { slug?: string; bodyMd?: string };
  if (!body.slug || typeof body.bodyMd !== "string") {
    return NextResponse.json({ error: "slug and bodyMd required." }, { status: 400 });
  }
  if (!(CONTENT_SLUGS as readonly string[]).includes(body.slug)) {
    return NextResponse.json({ error: "Invalid slug." }, { status: 400 });
  }

  await writeContent(body.slug as ContentSlug, body.bodyMd, admin.id);
  return NextResponse.json({ ok: true });
}
