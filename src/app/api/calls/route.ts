import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.contactId || !body.direction || !body.startTime || !body.durationSeconds || !body.ownerId) {
    return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
  }

  const call = await prisma.call.create({
    data: {
      contactId: body.contactId,
      direction: body.direction,
      startTime: new Date(body.startTime),
      durationSeconds: Number(body.durationSeconds),
      ownerId: body.ownerId
    },
    include: {
      contact: true,
      owner: true
    }
  });

  return NextResponse.json({
    id: call.id,
    contactName: call.contact.name,
    direction: call.direction,
    startTime: call.startTime.toISOString(),
    durationSeconds: call.durationSeconds,
    ownerName: call.owner.name
  });
}
