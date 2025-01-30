ALTER TABLE "gallery_repo" ALTER COLUMN "tags" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "gallery_repo" ALTER COLUMN "tags" SET DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "gallery_repo" ALTER COLUMN "tags" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "gallery_repo" ALTER COLUMN "type" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "gallery_repo" ALTER COLUMN "type" SET NOT NULL;