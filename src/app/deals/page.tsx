import { DealsClient, type CompanyOption, type ContactOption, type DealCard, type OwnerOption } from "./deals-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const [deals, companies, contacts, users] = await Promise.all([
    prisma.deal.findMany({
      include: {
        company: true,
        contact: true
      },
      orderBy: {
        createdAt: "asc"
      }
    }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
    prisma.contact.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } })
  ]);

  const cards: DealCard[] = deals.map((deal) => ({
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
  }));

  const companyOptions: CompanyOption[] = companies.map((company) => ({
    id: company.id,
    name: company.name
  }));

  const contactOptions: ContactOption[] = contacts.map((contact) => ({
    id: contact.id,
    name: contact.name
  }));

  const owners: OwnerOption[] = users.map((user) => ({
    id: user.id,
    name: user.name
  }));

  return <DealsClient companies={companyOptions} contacts={contactOptions} initialDeals={cards} owners={owners} />;
}
