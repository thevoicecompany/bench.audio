-- CreateEnum
CREATE TYPE "ConvoType" AS ENUM ('Online', 'Phone');

-- CreateEnum
CREATE TYPE "ConvoLength" AS ENUM ('Short', 'Medium', 'Unbounded');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('Retell', 'Vapi', 'Bland');

-- CreateEnum
CREATE TYPE "BattleState" AS ENUM ('Idle', 'PreparingConvoA', 'InProgressConvoA', 'DoneConvoA', 'PreparingConvoB', 'InProgressConvoB', 'DoneConvoB', 'Voting', 'Done', 'Cancelled', 'Error');

-- CreateEnum
CREATE TYPE "Outcome" AS ENUM ('WinA', 'WinB', 'Tie', 'TieBothBad');

-- CreateTable
CREATE TABLE "User" (
    "uuid" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Elo" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 500,

    CONSTRAINT "Elo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "provider" "Provider" NOT NULL,
    "llmConfig" JSONB NOT NULL,
    "asrConfig" JSONB,
    "ttsConfig" JSONB,
    "extraConfig" JSONB,
    "eloId" TEXT,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convo" (
    "id" TEXT NOT NULL,
    "prompt" JSONB,
    "convoTranscript" TEXT,
    "inputAudioFileId" TEXT,
    "outputAudioFileId" TEXT,

    CONSTRAINT "Convo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "convoLength" "ConvoLength" NOT NULL,
    "convoType" "ConvoType" NOT NULL,
    "userUuid" TEXT NOT NULL,
    "modelAId" TEXT NOT NULL,
    "modelBId" TEXT NOT NULL,
    "convoAId" TEXT,
    "convoBId" TEXT,
    "state" "BattleState" NOT NULL,
    "outcome" "Outcome",

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Model_label_key" ON "Model"("label");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_eloId_fkey" FOREIGN KEY ("eloId") REFERENCES "Elo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_modelAId_fkey" FOREIGN KEY ("modelAId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_modelBId_fkey" FOREIGN KEY ("modelBId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_convoAId_fkey" FOREIGN KEY ("convoAId") REFERENCES "Convo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_convoBId_fkey" FOREIGN KEY ("convoBId") REFERENCES "Convo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
