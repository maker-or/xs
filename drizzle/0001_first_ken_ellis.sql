CREATE TABLE IF NOT EXISTS "gallery_repo" (
	"rId" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "gallery_repo_rId_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar(1024) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"fileurl" varchar(255) NOT NULL,
	"tags" varchar(255) NOT NULL,
	"year" varchar(255) NOT NULL,
	"branch" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "repo_idx" ON "gallery_repo" USING btree ("userId");