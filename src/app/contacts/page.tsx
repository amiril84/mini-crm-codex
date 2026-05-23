import { ContactsClient, type CompanyOption, type ContactRow, type OwnerOption } from "./contacts-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [contacts, companies, users] = await Promise.all([
    prisma.contact.findMany({
      include: {
        company: true,
        owner: true,
        deals: true,
        calls: true
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.company.findMany({
      orderBy: {
        name: "asc"
      }
    }),
    prisma.user.findMany({
      orderBy: {
        name: "asc"
      }
    })
  ]);

  const rows: ContactRow[] = contacts.map((contact) => ({
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
  }));

  const companyOptions: CompanyOption[] = companies.map((company) => ({
    id: company.id,
    name: company.name
  }));

  const owners: OwnerOption[] = users.map((user) => ({
    id: user.id,
    name: user.name
  }));

  return <ContactsClient companies={companyOptions} initialContacts={rows} owners={owners} />;
}
