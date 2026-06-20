-- CreateTable
CREATE TABLE "Reaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate existing PostLike data → Reaction with ❤️
INSERT INTO "Reaction" ("userId", "targetType", "targetId", "emoji", "createdAt")
SELECT "userId", 'post', "postId", '❤️', CURRENT_TIMESTAMP FROM "PostLike";

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_targetType_targetId_emoji_key" ON "Reaction"("userId", "targetType", "targetId", "emoji");

-- CreateIndex
CREATE INDEX "Reaction_targetType_targetId_idx" ON "Reaction"("targetType", "targetId");

-- DropTable
DROP TABLE "PostLike";
