import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { db } from "~/server/db";
import { getAuth } from "@clerk/nextjs/server";
// import { posts } from "~/server/db/schema";


const f = createUploadthing();

  export const ourFileRouter = {
    imageUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 40 } })
      .middleware(async ({ req }) => {

        const { userId } = getAuth(req);

        if (!userId) throw new Error("Unauthorized");


        // const customMetadata = req.headers.get("x-uploadthingx-metadat");
        // console.log("customMetadata", customMetadata);
       // let folderId = 2; // Default value
        // if (customMetadata) {
        //   try {
        //     const parsedMetadata = JSON.parse(customMetadata) as { folderId: string };
        //     folderId = parseInt(parsedMetadata.folderId, 10) || 2; 
        //   } catch (error) {
        //     console.error("Failed to parse metadata:", error);
        //   }
        // }
          

        return { userId };
      })
    .onUploadComplete(async ({ metadata, file }) => {
    
      // console.log("Upload complete for folderId:", metadata.folderId);

      // await db.insert(posts).values({
      //   id:100,
      //   name: file.name,
      //   url: file.url,
      //   userId: metadata.userId,
      //   folderId:2, 
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // });
      console.log("file information",file);
      return {...file,
        userId: metadata.userId};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;