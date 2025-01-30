// import { db } from "~/server/db";
// import { and, eq } from "drizzle-orm";
// import { repo } from "../schema";

// interface FileResponse {
//   doId: number;
//   filename: string;
//   subject: string;
//   tags: string | string[]; // Allow tags to be either a string or an array of strings
//   fileurl: string;
//   year: string;
//   branch: string;
// }

// export async function convertTagsToArray() {
//   const files = await db.select().from(repo);
  
//   for (const file of files) {
//     await db
//       .update(repo)
//       .set({
//         tags: typeof file.tags === 'string' 
//           ? file.tags.split(',').map((tag: string) => tag.trim())
//           : Array.isArray(file.tags) 
//             ? file.tags 
//             : []
//       })
//       .where(eq(repo.doId, file.doId));
//   }
// }