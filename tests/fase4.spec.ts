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

async function createDragTestDeal() {
  const [owner, company, contact] = await Promise.all([
    prisma.user.findFirstOrThrow(),
    prisma.company.findFirstOrThrow(),
    prisma.contact.findFirstOrThrow()
  ]);

  return prisma.deal.create({
    data: {
      dealName: `Drag Precision Deal ${Date.now()}`,
      amount: 4321,
      stage: "Qualification",
      expectedCloseDate: new Date("2026-07-15T00:00:00.000Z"),
      ownerId: owner.id,
      companyId: company.id,
      contactId: contact.id
    }
  });
}

async function totalFor(page: import("@playwright/test").Page, stage: string) {
  return Number(await page.getByTestId(`total-${stage}`).getAttribute("data-total"));
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

test("fase 4 drag and drop updates stage totals optimistically and persists", async ({ page }) => {
  await page.context().addCookies([{ name: "crm_session", value: "active", url: "http://127.0.0.1:3000" }]);
  const sourceStage = "Qualification";
  const targetStage = "Proposal/Price Quote";
  const deal = await createDragTestDeal();
  const dealAmount = Number(deal.amount);
  let patchRequestResolved = false;

  await page.route(`**/api/deals/${deal.id}`, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    patchRequestResolved = true;
    await route.continue();
  });

  await page.goto("/deals");

  const sourceTotalBefore = await totalFor(page, sourceStage);
  const targetTotalBefore = await totalFor(page, targetStage);
  const card = page.getByTestId(`deal-card-${deal.id}`);
  const targetColumn = page.getByTestId(`stage-${targetStage}`);

  await expect(card).toBeVisible();
  await expect(targetColumn).toBeVisible();
  expect(sourceTotalBefore).toBeGreaterThanOrEqual(dealAmount);

  const patchResponsePromise = page.waitForResponse(
    (response) => response.url().includes(`/api/deals/${deal.id}`) && response.status() === 200
  );

  await card.dragTo(targetColumn);

  const sourceTotalImmediatelyAfterDrop = await totalFor(page, sourceStage);
  const targetTotalImmediatelyAfterDrop = await totalFor(page, targetStage);

  expect(patchRequestResolved).toBe(false);
  expect(sourceTotalImmediatelyAfterDrop).toBe(sourceTotalBefore - dealAmount);
  expect(targetTotalImmediatelyAfterDrop).toBe(targetTotalBefore + dealAmount);
  await expect(card).toHaveAttribute("data-stage", targetStage);

  await patchResponsePromise;
  await page.reload();

  await expect(page.getByTestId(`stage-${targetStage}`).getByTestId(`deal-card-${deal.id}`)).toBeVisible();
  await expect(page.getByTestId(`stage-${sourceStage}`).getByTestId(`deal-card-${deal.id}`)).toHaveCount(0);
});
