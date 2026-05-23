import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.taskName || !body.dueDate || !body.status || !body.priority || !body.ownerId) {
    return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      taskName: body.taskName,
      dueDate: new Date(body.dueDate),
      status: body.status,
      priority: body.priority,
      ownerId: body.ownerId
    },
    include: {
      owner: true
    }
  });

  return NextResponse.json({
    id: task.id,
    taskName: task.taskName,
    dueDate: task.dueDate.toISOString(),
    status: task.status,
    priority: task.priority,
    ownerName: task.owner.name
  });
}
