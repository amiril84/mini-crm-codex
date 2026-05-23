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
      stage: body.stage
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
