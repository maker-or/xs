// import { auth } from "@clerk/nextjs/server";
// import { db } from "~/server/db";
// import { posts } from "./db/schema";
// import { ilike } from "drizzle-orm";

// export default async function getsearch(searchtext: string) {
//   try {
//     const { userId } = (await auth()) as { userId: string | null };
//     console.log("userId from query.ts:", userId);

//     if (!userId) return null;

//     const search = await db
//       .select({ name: posts.name }) // Select only the `name` column
//       .from(posts)
//       .where(ilike(posts.name, `%${searchtext}%`)); // Match search text

//     // Map and return only filenames
//     return search.map((result) => result.name);
//   } catch (error) {
//     console.error("Error fetching search:", error);
//     return null;
//   }
// }
