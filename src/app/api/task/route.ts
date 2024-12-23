import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { tasks } from "~/server/db/schema";

interface TaskData {
  task: string;
  date: string;
  month: string;
  year: string;
}

export async function GET() {
  try {
    const { userId } = (await auth()) as { userId: string | null };


    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const mon = currentMonth + 1;

    console.log('uid:', { userId, currentYear, mon });

    const todos = await db
      .select({ task: tasks.task, date: tasks.date })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.year, String(currentYear)),
          eq(tasks.month, String(mon))
        )
      );
  
    console.log("todos", todos);
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
    taskData = await request.json() as TaskData;
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  if (!taskData.task || !taskData.date) {
    return new NextResponse("Missing task or date", { status: 400 });
  }

  const [todo] = await db
    .insert(tasks)
    .values({
      userId,
      task: taskData.task,
      date: taskData.date,
      month: taskData.month,
      year: '2024'
    })
    .returning({ task: tasks.task, date: tasks.date });

  return NextResponse.json(todo);
}