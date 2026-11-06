import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  TextChannel,
  PermissionFlagsBits,
} from "discord.js";
import { prisma } from "@wc3dd/db";
import { processQueue } from "./queue.js";

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
const pollMs = Number(process.env.BOT_POLL_INTERVAL_MS ?? 5000);

if (!token) {
  console.error("DISCORD_BOT_TOKEN is required");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember],
});

async function registerCommands() {
  if (!guildId) {
    console.warn("DISCORD_GUILD_ID missing — skipping slash command registration");
    return;
  }
  const commands = [
    new SlashCommandBuilder()
      .setName("health")
      .setDescription("WC3DD bot health check (admins)")
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .toJSON(),
  ];
  const rest = new REST({ version: "10" }).setToken(token!);
  const appId = (await client.application?.fetch())?.id ?? client.user?.id;
  if (!appId) {
    console.warn("Could not resolve application id for commands");
    return;
  }
  await rest.put(Routes.applicationGuildCommands(appId, guildId), { body: commands });
  console.log("Registered /health guild command");
}

client.once("ready", async () => {
  console.log(`WC3DD bot online as ${client.user?.tag}`);
  try {
    await registerCommands();
  } catch (err) {
    console.error("Command registration failed", err);
  }

  const tick = async () => {
    try {
      await processQueue(client);
    } catch (err) {
      console.error("Queue processing error", err);
    }
  };
  await tick();
  setInterval(tick, Number.isFinite(pollMs) ? pollMs : 5000);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "health") return;

  const pending = await prisma.discordAction.count({ where: { status: "pending" } });
  const failed = await prisma.discordAction.count({ where: { status: "failed" } });
  const approved = await prisma.user.count({ where: { status: "approved", isSim: false } });

  const channel = interaction.channel;
  const channelOk = channel && "isTextBased" in channel ? true : false;

  await interaction.reply({
    ephemeral: true,
    content: [
      "**WC3DD bot health**",
      `Guild: ${guildId ?? "unset"}`,
      `Pending DiscordActions: ${pending}`,
      `Failed DiscordActions: ${failed}`,
      `Approved players: ${approved}`,
      `Channel ok: ${channelOk}`,
      "Language: English",
    ].join("\n"),
  });
});

client.login(token).catch((err) => {
  console.error("Failed to login Discord bot", err);
  process.exit(1);
});

export type { TextChannel };
