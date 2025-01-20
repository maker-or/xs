CREATE TABLE IF NOT EXISTS "gallery_dod" (
	"doId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gallery_dod_doId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar(1024) NOT NULL,
	"task" varchar(255) NOT NULL,
	"completed" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gallery_folders" (
	"folderId" integer PRIMARY KEY NOT NULL,
	"folderName" varchar(256) NOT NULL,
	"userId" varchar(1024) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gallery_post" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gallery_post_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"userId" varchar(1024) NOT NULL,
	"folderId" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"url" varchar(1024) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gallery_tasks" (
	"taskId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gallery_tasks_taskId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar(1024) NOT NULL,
	"task" varchar(255) NOT NULL,
	"date" varchar NOT NULL,
	"month" varchar NOT NULL,
	"year" varchar NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gallery_post" ADD CONSTRAINT "gallery_post_folderId_gallery_folders_folderId_fk" FOREIGN KEY ("folderId") REFERENCES "public"."gallery_folders"("folderId") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dod_idx" ON "gallery_dod" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_idx" ON "gallery_folders" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "gallery_post" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "use_idx" ON "gallery_tasks" USING btree ("userId");