CREATE TABLE IF NOT EXISTS "gallery_chats" (
	"chId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gallery_chats_chId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar(1024) NOT NULL,
	"messages" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "gallery_repo" ALTER COLUMN "tags" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gallery_repo" ALTER COLUMN "tags" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chats_user_idx" ON "gallery_chats" USING btree ("userId");