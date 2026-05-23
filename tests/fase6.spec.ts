import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";

const prisma = new PrismaClient();
let server: ChildProcess | undefined;

async function isServerReady() {
  try {
    const response = await fetch("http://127.0.0.1:3000");
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 120_000) {
    if (await isServerReady()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error("Next.js dev server did not start within 120 seconds.");
}

async function createDetailTestDeal() {
  const [owner, company, contact] = await Promise.all([
    prisma.user.findFirstOrThrow(),
    prisma.company.findFirstOrThrow(),
    prisma.contact.findFirstOrThrow()
  ]);

  return prisma.deal.create({
    data: {
      dealName: `Detail Panel Deal ${Date.now()}`,
      amount: 6789,
      stage: "Negotiation",
      expectedCloseDate: new Date("2026-09-10T00:00:00.000Z"),
      ownerId: owner.id,
      companyId: company.id,
      contactId: contact.id
    },
    include: {
      company: true,
      contact: true
    }
  });
}

test.beforeAll(async () => {
  if (!(await isServerReady())) {
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1"],
      {
        cwd: process.cwd(),
        env: { ...process.env, PORT: "3000" },
        shell: false,
        stdio: "ignore"
      }
    );

    await waitForServer();
  }
});

test.afterAll(async () => {
  await prisma.$disconnect();

  if (!server?.pid) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    server.kill("SIGTERM");
  }
});

test("fase 6 clicking a deal opens a right-side detail panel", async ({ page }) => {
  await page.context().addCookies([{ name: "crm_session", value: "active", url: "http://127.0.0.1:3000" }]);
  const deal = await createDetailTestDeal();

  await page.goto("/deals");
  const card = page.getByTestId(`deal-card-${deal.id}`);
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();
  await card.click();

  const detailPanel = page.getByLabel("Deal detail panel");
  await expect(detailPanel).toBeVisible();
  await expect(detailPanel).toContainText(deal.dealName);
  await expect(detailPanel).toContainText("$6,789");
  await expect(detailPanel).toContainText("Negotiation");
  await expect(detailPanel).toContainText(deal.company?.name ?? "");
  await expect(detailPanel).toContainText(deal.contact?.name ?? "");

  await page.getByLabel("Close deal detail").click();
  await expect(detailPanel).toHaveCount(0);
});

test("deals page creates a new deal from the kanban action button", async ({ page }) => {
  await page.context().addCookies([{ name: "crm_session", value: "active", url: "http://127.0.0.1:3000" }]);
  const unique = Date.now();
  const dealName = `Manual Add Deal ${unique}`;

  await page.goto("/deals");
  await page.getByRole("button", { name: "Deal" }).click();
  await page.getByLabel("Deal Name").fill(dealName);
  await page.getByLabel("Amount").fill("2468");
  await page.getByLabel("Stage").selectOption("Needs Analysis");
  await page.getByRole("button", { name: "Save Deal" }).click();

  const createdCard = page.getByTestId("stage-Needs Analysis").getByText(dealName);
  await expect(createdCard).toBeVisible();
  await expect(page.getByTestId("stage-Needs Analysis")).toContainText(dealName);
  await expect(page.getByLabel("Deal detail panel")).toContainText("$2,468");
});
