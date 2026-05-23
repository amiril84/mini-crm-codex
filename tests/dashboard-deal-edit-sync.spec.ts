import { expect, test } from "@playwright/test";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";

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
  if (!server?.pid) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    server.kill("SIGTERM");
  }
});

test("dashboard revenue updates immediately after editing a Closed Won deal amount", async ({ page }) => {
  await page.setViewportSize({ width: 2200, height: 1000 });
  await page.context().addCookies([{ name: "crm_session", value: "active", url: "http://127.0.0.1:3000" }]);

  await page.goto("/");
  const revenueBefore = await dashboardRevenue(page);

  await page.getByRole("link", { name: "Deals" }).click();
  await expect(page).toHaveURL(/\/deals$/);

  const dealName = `Dashboard Sync Closed Won ${Date.now()}`;
  await page.getByRole("button", { name: "Deal" }).click();
  await page.getByLabel("Deal Name").fill(dealName);
  await page.getByLabel("Amount").fill("1000");
  await page.getByLabel("Stage").selectOption("Closed Won");
  await page.getByLabel("Expected Close Date").fill("2026-10-01");
  await page.getByRole("button", { name: "Save Deal" }).click();
  await expect(page.getByLabel("Deal detail panel")).toContainText(dealName);

  const closedWonTotalBefore = Number(await page.getByTestId("total-Closed Won").getAttribute("data-total"));

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Amount").fill("1750");
  const patchResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/deals/") && response.status() === 200
  );
  await page.getByRole("button", { name: "Update Deal" }).click();
  await patchResponsePromise;

  await expect(page.getByTestId("total-Closed Won")).toHaveAttribute(
    "data-total",
    String(closedWonTotalBefore + 750)
  );

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByTestId("metric-total-revenue")).toHaveAttribute(
    "data-value",
    String(revenueBefore + 1750)
  );
});
