import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const allowedStages = new Set([
  "Qualification",
  "Needs Analysis",
  "Proposal/Price Quote",
  "Negotiation",
  "Closed Won",
  "Closed Lost"
]);

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  if (!allowedStages.has(body.stage)) {
    return NextResponse.json({ message: "Invalid deal stage." }, { status: 400 });
  }

  const deal = await prisma.deal.update({
    where: {
      id: params.id
    },
    data: {
      ...(body.dealName ? { dealName: body.dealName } : {}),
      ...(body.amount ? { amount: Number(body.amount) } : {}),
      stage: body.stage,
      ...(body.expectedCloseDate ? { expectedCloseDate: new Date(body.expectedCloseDate) } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, "companyId") ? { companyId: body.companyId || null } : {}),
      ...(Object.prototype.hasOwnProperty.call(body, "contactId") ? { contactId: body.contactId || null } : {}),
      ...(body.ownerId ? { ownerId: body.ownerId } : {})
    },
    include: {
      company: true,
      contact: true
    }
  });

  return NextResponse.json({
    id: deal.id,
    dealName: deal.dealName,
    amount: Number(deal.amount),
    stage: deal.stage,
    expectedCloseDate: deal.expectedCloseDate.toISOString(),
    companyId: deal.companyId,
    companyName: deal.company?.name ?? null,
    contactId: deal.contactId,
    contactName: deal.contact?.name ?? null,
    ownerId: deal.ownerId
  });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.deal.delete({
    where: {
      id: params.id
    }
  });

  return NextResponse.json({ ok: true });
}
