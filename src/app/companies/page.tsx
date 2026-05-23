import { CompaniesClient, type CompanyRow, type OwnerOption } from "./companies-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const [companies, users] = await Promise.all([
    prisma.company.findMany({
      include: {
        owner: true,
        contacts: true,
        deals: true
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.user.findMany({
      orderBy: {
        name: "asc"
      }
    })
  ]);

  const rows: CompanyRow[] = companies.map((company) => ({
    id: company.id,
    name: company.name,
    phone: company.phone,
    website: company.website,
    ownerName: company.owner.name,
    createdAt: company.createdAt.toISOString(),
    contactsCount: company.contacts.length,
    dealsCount: company.deals.length
  }));

  const owners: OwnerOption[] = users.map((user) => ({
    id: user.id,
    name: user.name
  }));

  return <CompaniesClient initialCompanies={rows} owners={owners} />;
}
