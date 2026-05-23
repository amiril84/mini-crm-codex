import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeCompany(company: {
  id: string;
  name: string;
  phone: string;
  website: string;
  ownerId: string;
  createdAt: Date;
  owner: { name: string };
  contacts: unknown[];
  deals: unknown[];
}) {
  return {
    id: company.id,
    name: company.name,
    phone: company.phone,
    website: company.website,
    ownerId: company.ownerId,
    ownerName: company.owner.name,
    createdAt: company.createdAt.toISOString(),
    contactsCount: company.contacts.length,
    dealsCount: company.deals.length
  };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  if (!body.name || !body.phone || !body.website || !body.ownerId) {
    return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
  }

  const company = await prisma.company.update({
    where: { id: params.id },
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

  return NextResponse.json(serializeCompany(company));
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.company.delete({
    where: { id: params.id }
  });

  return NextResponse.json({ ok: true });
}
