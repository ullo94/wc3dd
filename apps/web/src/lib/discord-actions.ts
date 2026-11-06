import { prisma, type DiscordActionType, Prisma } from "@wc3dd/db";

export async function enqueueDiscordActions(
  userId: string,
  types: DiscordActionType[],
  payload?: Prisma.InputJsonValue,
) {
  await prisma.discordAction.createMany({
    data: types.map((type) => ({
      type,
      userId,
      payload: payload ?? {},
      status: "pending",
    })),
  });
}

export async function enqueueApprovalActions(userId: string) {
  await enqueueDiscordActions(userId, [
    "assign_role",
    "set_nickname",
    "announce_approval",
    "send_invite",
  ]);
}
