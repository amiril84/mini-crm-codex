import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";

const prisma = new PrismaClient();
let server: ChildProcess | undefined;

async function isServerReady() {
  try {
    const response = await fetch("http://127.0.0.1:3000/login");
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

async function createRevenueSyncDeal() {
  const [owner, company, contact] = await Promise.all([
    prisma.user.findFirstOrThrow(),
    prisma.company.findFirstOrThrow(),
    prisma.contact.findFirstOrThrow()
  ]);

  return prisma.deal.create({
    data: {
      dealName: `Revenue Sync Deal ${Date.now()}`,
      amount: 500,
      stage: "Qualification",
      expectedCloseDate: new Date("2026-08-01T00:00:00.000Z"),
      ownerId: owner.id,
      companyId: company.id,
      contactId: contact.id
    }
  });
}

async function dashboardRevenue(page: import("@playwright/test").Page) {
  return Number(await page.getByTestId("metric-total-revenue").getAttribute("data-value"));
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

test("fase 5 protects dashboard login and syncs total revenue after deal closes", async ({ page }) => {
  await page.setViewportSize({ width: 2200, height: 1000 });
  const deal = await createRevenueSyncDeal();

  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.context().addCookies([{ name: "crm_session", value: "active", url: "http://127.0.0.1:3000" }]);

  const revenueBefore = await dashboardRevenue(page);

  await page.goto("http://127.0.0.1:3000/deals");
  await expect(page).toHaveURL(/\/deals$/);
  const card = page.getByTestId(`deal-card-${deal.id}`);
  const closedWonColumn = page.getByTestId("stage-Closed Won");
  await expect(card).toHaveCount(1);
  await card.scrollIntoViewIfNeeded();
  await expect(card).toBeVisible();

  const patchResponsePromise = page.waitForResponse(
    (response) => response.url().includes(`/api/deals/${deal.id}`) && response.status() === 200
  );
  await card.dragTo(closedWonColumn);
  await patchResponsePromise;

  await page.goto("http://127.0.0.1:3000/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  const revenueAfter = await dashboardRevenue(page);

  expect(revenueAfter).toBe(revenueBefore + 500);
});
