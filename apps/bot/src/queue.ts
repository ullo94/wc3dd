import {
  Client,
  GuildMember,
  TextChannel,
} from "discord.js";
import { prisma, type DiscordAction } from "@wc3dd/db";

const roleId = process.env.DISCORD_PARTICIPANT_ROLE_ID;
const approvalChannelId = process.env.DISCORD_APPROVAL_CHANNEL_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const inviteUrl = process.env.DISCORD_INVITE_URL;

async function markDone(id: string) {
  await prisma.discordAction.update({
    where: { id },
    data: { status: "done", processedAt: new Date() },
  });
}

async function markFailed(id: string, error: string, attempts: number) {
  await prisma.discordAction.update({
    where: { id },
    data: {
      status: attempts >= 5 ? "failed" : "pending",
      error,
      attempts: { increment: 1 },
      processedAt: new Date(),
    },
  });
}

async function resolveMember(client: Client, discordId: string): Promise<GuildMember | null> {
  if (!guildId) return null;
  const guild = await client.guilds.fetch(guildId);
  try {
    return await guild.members.fetch(discordId);
  } catch {
    return null;
  }
}

async function handleAction(client: Client, action: DiscordAction & { user: { discordId: string; tournamentName: string | null; discordUsername: string | null } | null }) {
  const user = action.user;
  if (!user) {
    await markFailed(action.id, "Missing user", action.attempts + 1);
    return;
  }

  switch (action.type) {
    case "assign_role": {
      if (!roleId) {
        await markFailed(action.id, "DISCORD_PARTICIPANT_ROLE_ID not set", 99);
        return;
      }
      const member = await resolveMember(client, user.discordId);
      if (!member) {
        await markFailed(action.id, "Member not in guild yet", action.attempts + 1);
        return;
      }
      await member.roles.add(roleId, "WC3DD registration approved");
      await markDone(action.id);
      return;
    }
    case "set_nickname": {
      const member = await resolveMember(client, user.discordId);
      if (!member) {
        await markFailed(action.id, "Member not in guild yet", action.attempts + 1);
        return;
      }
      const nick = (user.tournamentName ?? user.discordUsername ?? "Player").slice(0, 32);
      try {
        await member.setNickname(nick, "WC3DD tournament name");
      } catch (err) {
        await markFailed(
          action.id,
          `Nickname failed (hierarchy?): ${err instanceof Error ? err.message : String(err)}`,
          action.attempts + 1,
        );
        return;
      }
      await markDone(action.id);
      return;
    }
    case "announce_approval": {
      if (!approvalChannelId) {
        await markDone(action.id);
        return;
      }
      const channel = await client.channels.fetch(approvalChannelId);
      if (!channel || !channel.isTextBased()) {
        await markFailed(action.id, "Approval channel not text-based", 99);
        return;
      }
      const name = user.tournamentName ?? user.discordUsername ?? user.discordId;
      await (channel as TextChannel).send({
        content: `✅ **${name}** has been approved for WC3DD. Welcome to the league!`,
      });
      await markDone(action.id);
      return;
    }
    case "send_invite": {
      // Invite is best-effort; guilds.join requires OAuth access token we don't store in M1.
      // Log invite URL in approval channel if member missing.
      const member = await resolveMember(client, user.discordId);
      if (member) {
        await markDone(action.id);
        return;
      }
      if (approvalChannelId && inviteUrl) {
        const channel = await client.channels.fetch(approvalChannelId);
        if (channel?.isTextBased()) {
          await (channel as TextChannel).send({
            content: `ℹ️ <@${user.discordId}> is approved but not in the guild yet. Invite: ${inviteUrl}`,
          });
        }
      }
      await markDone(action.id);
      return;
    }
    default:
      await markFailed(action.id, `Unknown action type ${action.type}`, 99);
  }
}

export async function processQueue(client: Client) {
  const batch = await prisma.discordAction.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 10,
    include: {
      user: {
        select: {
          discordId: true,
          tournamentName: true,
          discordUsername: true,
          isSim: true,
        },
      },
    },
  });

  for (const action of batch) {
    if (action.user?.isSim) {
      await markDone(action.id);
      continue;
    }
    await prisma.discordAction.update({
      where: { id: action.id },
      data: { status: "processing" },
    });
    try {
      await handleAction(client, action);
    } catch (err) {
      await markFailed(
        action.id,
        err instanceof Error ? err.message : String(err),
        action.attempts + 1,
      );
    }
  }
}
