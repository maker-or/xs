ALTER TABLE "gallery_repo" ALTER COLUMN "tags" SET DATA TYPE text[];
ALTER TABLE "gallery_repo" ALTER COLUMN "tags" DROP NOT NULL;