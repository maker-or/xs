// import { NextResponse } from "next/server";
// import { db } from "~/server/db";
// import { auth } from "@clerk/nextjs/server";
// import { tasks } from "~/server/db/schema";
// import { eq } from "drizzle-orm";

// interface TaskData {
//   id: string;
//   task: string;
//   date: string;
// }

// export async function PATCH(request: Request) {
//   // Authenticate user concurrently with JSON parsing
//   const [userAuth, { id, task, date }] = await Promise.all([
//     auth(),
//     request.json() as Promise<TaskData>
//   ]);

//   const { userId } = userAuth;
//   if (!userId) {
//     return new NextResponse("Unauthorized", { status: 401 });
//   }

//   try {
//     // Ensure 'tasks.taskId' is indexed for faster lookup
//     const updatedTask = await db
//       .update(tasks)
//       .set({ task, date })
//       .where(eq(tasks.tasksId, parseInt(id, 10)))
//       .returning();

//     return NextResponse.json(updatedTask);
//   } catch  {
//     return new NextResponse("Failed to update task", { status: 500 });
//   }
// }