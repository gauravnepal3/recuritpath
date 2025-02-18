-- CreateEnum
CREATE TYPE "EmailDirection" AS ENUM ('SENT', 'RECEIVED');

-- CreateTable
CREATE TABLE "EmailMessage" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "parentMessageId" TEXT,
    "sender" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "s3Url" TEXT,
    "direction" "EmailDirection" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_messageId_key" ON "EmailMessage"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailMessage_parentMessageId_key" ON "EmailMessage"("parentMessageId");

-- CreateIndex
CREATE INDEX "EmailMessage_parentMessageId_idx" ON "EmailMessage"("parentMessageId");

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "EmailMessage"("messageId") ON DELETE SET NULL ON UPDATE CASCADE;
