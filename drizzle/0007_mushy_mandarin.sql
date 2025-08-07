ALTER TABLE "users" RENAME COLUMN "id" TO "chId";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "id" TO "chId";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "chId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "chId" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "chId" ADD GENERATED ALWAYS AS IDENTITY (sequence name "users_chId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "chId" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "chId" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "chId" ADD GENERATED ALWAYS AS IDENTITY (sequence name "verification_chId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);