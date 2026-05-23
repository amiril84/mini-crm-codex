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

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.dealName || !body.amount || !body.stage || !body.expectedCloseDate || !body.ownerId) {
    return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
  }

  if (!allowedStages.has(body.stage)) {
    return NextResponse.json({ message: "Invalid deal stage." }, { status: 400 });
  }

  const deal = await prisma.deal.create({
    data: {
      dealName: body.dealName,
      amount: Number(body.amount),
      stage: body.stage,
      expectedCloseDate: new Date(body.expectedCloseDate),
      companyId: body.companyId || null,
      contactId: body.contactId || null,
      ownerId: body.ownerId
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
    companyName: deal.company?.name ?? null,
    contactName: deal.contact?.name ?? null
  });
}
