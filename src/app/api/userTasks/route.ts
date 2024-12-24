import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { dod } from "~/server/db/schema";

interface TaskData {
  task: string;
}

export async function GET() {
  try {
    const { userId } = (await auth()) as { userId: string | null };

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("uid:", { userId });

    const todos = await db
      .select({ id: dod.doId, text: dod.task, completed: dod.completed })
      .from(dod)
      .where(and(eq(dod.userId, userId), eq(dod.completed, "false")));

    return NextResponse.json(todos);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = (await auth()) as { userId: string | null };

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let taskData: TaskData;
  try {
    taskData = (await request.json()) as TaskData;
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  if (!taskData.task) {
    return new NextResponse("Missing task", { status: 400 });
  }

  const createdAt = new Date();

  const [todo] = await db
    .insert(dod)
    .values({
      userId,
      task: taskData.task,
      completed: "false",
      createdAt: createdAt,
      updatedAt: createdAt,
    })
    .returning({ task: dod.task });

  return NextResponse.json(todo);
}

export async function PATCH(request: Request) {
  const { userId } = (await auth()) as { userId: string | null };

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let taskData: { taskId: number };
  try {
    taskData = (await request.json()) as { taskId: number };
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  if (!taskData.taskId) {
    return new NextResponse("Missing taskId", { status: 400 });
  }

  const [todo] = await db
    .update(dod)
    .set({
      completed: "true",
    })
    .where(eq(dod.doId, taskData.taskId))
    .returning({
      id: dod.doId,
      completed: dod.completed,
    });

  return NextResponse.json(todo);
}
