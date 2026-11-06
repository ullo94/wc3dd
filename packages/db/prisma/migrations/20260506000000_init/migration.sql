-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "SeasonStatus" AS ENUM ('registration', 'active', 'playoffs', 'finished');
CREATE TYPE "Race" AS ENUM ('HUMAN', 'ORC', 'UNDEAD', 'NIGHT_ELF');
CREATE TYPE "MatchStatus" AS ENUM ('scheduled', 'in_progress', 'reported', 'confirmed', 'voided');
CREATE TYPE "GameResult" AS ENUM ('player1_win', 'player2_win', 'draw', 'voided');
CREATE TYPE "DiscordActionType" AS ENUM ('assign_role', 'set_nickname', 'announce_approval', 'send_invite');
CREATE TYPE "DiscordActionStatus" AS ENUM ('pending', 'processing', 'done', 'failed');
CREATE TYPE "ContentSlug" AS ENUM ('rules', 'conduct', 'maps');
CREATE TYPE "DataSource" AS ENUM ('real', 'sim');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordUsername" TEXT,
    "discordAvatar" TEXT,
    "tournamentName" TEXT,
    "avatarHeroSlug" TEXT,
    "w3ChampionsUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'pending',
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "needsProfanityReview" BOOLEAN NOT NULL DEFAULT false,
    "profanityMatches" JSONB,
    "acceptedRulesAt" TIMESTAMP(3),
    "acceptedConductAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "isSim" BOOLEAN NOT NULL DEFAULT false,
    "source" "DataSource" NOT NULL DEFAULT 'real',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlayerCombo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "race" "Race" NOT NULL,
    "heroSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerCombo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SeasonStatus" NOT NULL DEFAULT 'registration',
    "currentWeek" INTEGER NOT NULL DEFAULT 0,
    "nextDeadline" TIMESTAMP(3),
    "finalsAt" TIMESTAMP(3),
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'scheduled',
    "bestOf" INTEGER NOT NULL DEFAULT 3,
    "scheduledAt" TIMESTAMP(3),
    "reportedAt" TIMESTAMP(3),
    "isSim" BOOLEAN NOT NULL DEFAULT false,
    "source" "DataSource" NOT NULL DEFAULT 'real',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "gameNumber" INTEGER NOT NULL,
    "mapName" TEXT,
    "player1Race" "Race",
    "player2Race" "Race",
    "player1Hero" TEXT,
    "player2Hero" TEXT,
    "result" "GameResult",
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Replay" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "originalName" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parsedOk" BOOLEAN,
    "parseNotes" TEXT,
    CONSTRAINT "Replay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Standing" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "gameWins" INTEGER NOT NULL DEFAULT 0,
    "gameLosses" INTEGER NOT NULL DEFAULT 0,
    "buchholz" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tiebreakerNotes" TEXT,
    "nextOpponentId" TEXT,
    "placement" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Standing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedId" TEXT,
    "body" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "slug" "ContentSlug" NOT NULL,
    "title" TEXT NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DiscordAction" (
    "id" TEXT NOT NULL,
    "type" "DiscordActionType" NOT NULL,
    "status" "DiscordActionStatus" NOT NULL DEFAULT 'pending',
    "userId" TEXT,
    "payload" JSONB,
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "DiscordAction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminAudit" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetId" TEXT,
    "action" TEXT NOT NULL,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProfanityAllowlist" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfanityAllowlist_pkey" PRIMARY KEY ("id")
);

-- Indexes / uniques
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_isSim_idx" ON "User"("isSim");
CREATE INDEX "User_tournamentName_idx" ON "User"("tournamentName");
CREATE UNIQUE INDEX "PlayerCombo_userId_slot_key" ON "PlayerCombo"("userId", "slot");
CREATE INDEX "PlayerCombo_userId_idx" ON "PlayerCombo"("userId");
CREATE INDEX "Match_seasonId_week_idx" ON "Match"("seasonId", "week");
CREATE INDEX "Match_isSim_idx" ON "Match"("isSim");
CREATE UNIQUE INDEX "Game_matchId_gameNumber_key" ON "Game"("matchId", "gameNumber");
CREATE UNIQUE INDEX "Standing_seasonId_userId_key" ON "Standing"("seasonId", "userId");
CREATE UNIQUE INDEX "ContentBlock_slug_key" ON "ContentBlock"("slug");
CREATE INDEX "DiscordAction_status_createdAt_idx" ON "DiscordAction"("status", "createdAt");
CREATE UNIQUE INDEX "ProfanityAllowlist_term_key" ON "ProfanityAllowlist"("term");

-- FKs
ALTER TABLE "PlayerCombo" ADD CONSTRAINT "PlayerCombo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Game" ADD CONSTRAINT "Game_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Replay" ADD CONSTRAINT "Replay_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Standing" ADD CONSTRAINT "Standing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DiscordAction" ADD CONSTRAINT "DiscordAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdminAudit" ADD CONSTRAINT "AdminAudit_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdminAudit" ADD CONSTRAINT "AdminAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
