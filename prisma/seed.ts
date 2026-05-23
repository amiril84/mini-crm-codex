import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const stages = [
  "Qualification",
  "Needs Analysis",
  "Proposal/Price Quote",
  "Negotiation",
  "Closed Won",
  "Closed Lost"
];

async function main() {
  await prisma.call.deleteMany();
  await prisma.event.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all(
    [
      ["Amelia Burrows", "amelia@zylker.example"],
      ["Patricia Boyle", "patricia@zylker.example"],
      ["Noah Ford", "noah@zylker.example"]
    ].map(([name, email]) =>
      prisma.user.create({
        data: { name, email }
      })
    )
  );

  const companyNames = [
    "Zylker",
    "Amazing Corp",
    "Acme Global",
    "Bluebird Labs",
    "Northstar Systems",
    "Evergreen Studio",
    "Summit Retail",
    "Orbit Works",
    "Metroline Group",
    "BrightByte"
  ];

  const companies = await Promise.all(
    companyNames.map((name, index) =>
      prisma.company.create({
        data: {
          name,
          phone: `+1-555-010${index}`,
          website: `https://${name.toLowerCase().replace(/\s+/g, "-")}.example`,
          ownerId: users[index % users.length].id,
          createdAt: new Date(2026, 4, 1 + index)
        }
      })
    )
  );

  const contactNames = [
    "Terrel Scaddon",
    "Patricia Boyle",
    "Marina Webb",
    "Dylan Shore",
    "Avery Miles",
    "Jon Bell",
    "Fatima Ellis",
    "Nadia Cole",
    "Marcus Lane",
    "Rina Sato",
    "Helen Foster",
    "Owen Blake"
  ];

  const contacts = await Promise.all(
    contactNames.map((name, index) =>
      prisma.contact.create({
        data: {
          name,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          phone: `+1-555-02${String(index).padStart(2, "0")}`,
          companyId: companies[index % companies.length].id,
          ownerId: users[index % users.length].id,
          createdAt: new Date(2026, 4, 3 + index)
        }
      })
    )
  );

  await Promise.all(
    Array.from({ length: 18 }, (_, index) =>
      prisma.deal.create({
        data: {
          dealName: `${companies[index % companies.length].name} Expansion ${index + 1}`,
          amount: 2500 + index * 750,
          stage: stages[index % stages.length],
          expectedCloseDate: new Date(2026, 5, 4 + index),
          companyId: companies[index % companies.length].id,
          contactId: contacts[index % contacts.length].id,
          ownerId: users[index % users.length].id,
          createdAt: new Date(2026, 4, 5 + index)
        }
      })
    )
  );

  await Promise.all(
    Array.from({ length: 12 }, (_, index) =>
      prisma.task.create({
        data: {
          taskName: `Follow up proposal ${index + 1}`,
          dueDate: new Date(2026, 5, 1 + index),
          status: index % 3 === 0 ? "Completed" : index % 3 === 1 ? "In Progress" : "Pending",
          priority: index % 3 === 0 ? "High" : index % 3 === 1 ? "Normal" : "Low",
          ownerId: users[index % users.length].id,
          createdAt: new Date(2026, 4, 8 + index)
        }
      })
    )
  );

  await Promise.all(
    Array.from({ length: 8 }, (_, index) =>
      prisma.event.create({
        data: {
          title: `Discovery meeting ${index + 1}`,
          startTime: new Date(2026, 5, 10 + index, 10, 0),
          endTime: new Date(2026, 5, 10 + index, 11, 0),
          ownerId: users[index % users.length].id,
          createdAt: new Date(2026, 4, 12 + index)
        }
      })
    )
  );

  await Promise.all(
    Array.from({ length: 10 }, (_, index) =>
      prisma.call.create({
        data: {
          contactId: contacts[index % contacts.length].id,
          direction: index % 2 === 0 ? "Outbound" : "Inbound",
          startTime: new Date(2026, 5, 15 + index, 14, 30),
          durationSeconds: 240 + index * 45,
          ownerId: users[index % users.length].id,
          createdAt: new Date(2026, 4, 15 + index)
        }
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
