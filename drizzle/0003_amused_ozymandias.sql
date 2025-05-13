DO $$ BEGIN
 CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gallery_exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" varchar(255) NOT NULL,
	"topic" varchar(255),
	"num_questions" integer NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"duration" integer NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"questions" json,
	"allowed_users" text[] NOT NULL,
	"created_by" varchar(128) NOT NULL,
	"organization_id" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gallery_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"answers" json,
	"score" integer NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"role" varchar(50) NOT NULL,
	"organisation_id" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gallery_results" ADD CONSTRAINT "gallery_results_exam_id_gallery_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."gallery_exams"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "exams_org_idx" ON "gallery_exams" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "exams_creator_idx" ON "gallery_exams" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "exams_time_idx" ON "gallery_exams" USING btree ("starts_at","ends_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "results_exam_idx" ON "gallery_results" USING btree ("exam_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "results_user_idx" ON "gallery_results" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "results_exam_user_idx" ON "gallery_results" USING btree ("exam_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_idx" ON "users" USING btree ("id");