-- AlterTable
ALTER TABLE "chat_members" ADD COLUMN     "last_seen_at" TIMESTAMP(3),
ADD COLUMN     "last_seen_message_id" TEXT;
