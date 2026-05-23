import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name || !body.email || !body.phone || !body.ownerId) {
    return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      companyId: body.companyId || null,
      ownerId: body.ownerId
    },
    include: {
      company: true,
      owner: true,
      deals: true,
      calls: true
    }
  });

  return NextResponse.json({
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    companyName: contact.company?.name ?? "Independent",
    ownerName: contact.owner.name,
    createdAt: contact.createdAt.toISOString(),
    dealsCount: contact.deals.length,
    callsCount: contact.calls.length
  });
}
