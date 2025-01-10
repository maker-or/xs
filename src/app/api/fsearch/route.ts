import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { posts } from "~/server/db/schema";
import { ilike } from "drizzle-orm";

export async function GET(req: Request) {
    try {
      const { userId } = await auth();
      if (!userId) {
        return new Response("Unauthorized", { status: 401 });
      }
  
      const url = new URL(req.url);
      const searchtext = url.searchParams.get("query") || "";
  
      const search = await db
        .select({ 
          name: posts.name,
          url: posts.url  // Include the URL in the selection
        })
        .from(posts)
        .where(ilike(posts.name, `%${searchtext}%`));
  
      return new Response(
        JSON.stringify({ 
          results: search.map(result => ({
            name: result.name,
            url: result.url
          }))
        }), 
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error fetching search:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }