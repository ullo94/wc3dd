import { NextResponse } from "next/server";
import { prisma } from "@wc3dd/db";
import { requireAdmin } from "@/lib/session";
import { enqueueApprovalActions } from "@/lib/discord-actions";

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }

  const body = (await req.json()) as {
    userId?: string;
    action?: "approve" | "reject";
    reason?: string;
  };

  if (!body.userId || !body.action) {
    return NextResponse.json({ error: "userId and action required." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (body.action === "approve") {
    await prisma.user.update({
      where: { id: target.id },
      data: {
        status: "approved",
        needsProfanityReview: false,
        rejectionReason: null,
      },
    });
    await prisma.adminAudit.create({
      data: {
        adminId: admin.id,
        targetId: target.id,
        action: "approve_registration",
      },
    });
    if (!target.isSim) {
      await enqueueApprovalActions(target.id);
    }
    return NextResponse.json({ ok: true });
  }

  await prisma.user.update({
    where: { id: target.id },
    data: {
      status: "rejected",
      rejectionReason: body.reason ?? "Rejected by admin",
    },
  });
  await prisma.adminAudit.create({
    data: {
      adminId: admin.id,
      targetId: target.id,
      action: "reject_registration",
      detail: { reason: body.reason ?? null },
    },
  });
  return NextResponse.json({ ok: true });
}
