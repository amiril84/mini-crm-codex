import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name || !body.phone || !body.website || !body.ownerId) {
    return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      name: body.name,
      phone: body.phone,
      website: body.website,
      ownerId: body.ownerId
    },
    include: {
      owner: true,
      contacts: true,
      deals: true
    }
  });

  return NextResponse.json({
    id: company.id,
    name: company.name,
    phone: company.phone,
    website: company.website,
    ownerName: company.owner.name,
    createdAt: company.createdAt.toISOString(),
    contactsCount: company.contacts.length,
    dealsCount: company.deals.length
  });
}
