import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeContact(contact: {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyId: string | null;
  ownerId: string;
  createdAt: Date;
  company: { name: string } | null;
  owner: { name: string };
  deals: unknown[];
  calls: unknown[];
}) {
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    companyId: contact.companyId,
    companyName: contact.company?.name ?? "Independent",
    ownerId: contact.ownerId,
    ownerName: contact.owner.name,
    createdAt: contact.createdAt.toISOString(),
    dealsCount: contact.deals.length,
    callsCount: contact.calls.length
  };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  if (!body.name || !body.email || !body.phone || !body.ownerId) {
    return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
  }

  const contact = await prisma.contact.update({
    where: { id: params.id },
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

  return NextResponse.json(serializeContact(contact));
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.contact.delete({
    where: { id: params.id }
  });

  return NextResponse.json({ ok: true });
}
