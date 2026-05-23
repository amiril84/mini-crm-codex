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

test.beforeAll(async () => {
  if (await isServerReady()) {
    return;
  }

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
});

test.afterAll(() => {
  if (!server?.pid) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    server.kill("SIGTERM");
  }
});

test("fase 3 switches activity tabs and creates a related call", async ({ page }) => {
  await page.context().addCookies([{ name: "crm_session", value: "active", url: "http://127.0.0.1:3000" }]);
  await page.goto("/activities");
  await expect(page.getByRole("heading", { name: "Activities" })).toBeVisible();

  await expect(page.getByRole("tabpanel", { name: "Tasks" })).toBeVisible();
  await expect(page.getByText("Task Name")).toBeVisible();

  await page.getByRole("tab", { name: "Events" }).click();
  await expect(page).toHaveURL(/\/activities$/);
  await expect(page.getByRole("tabpanel", { name: "Events" })).toBeVisible();
  await expect(page.getByText("Title")).toBeVisible();

  await page.getByRole("tab", { name: "Calls" }).click();
  await expect(page).toHaveURL(/\/activities$/);
  await expect(page.getByRole("tabpanel", { name: "Calls" })).toBeVisible();
  await expect(page.getByText("To/From")).toBeVisible();

  await page.getByRole("button", { name: "Call" }).click();
  const contactSelect = page.getByLabel("Contact");
  const contactName = await contactSelect.locator("option").first().textContent();

  await contactSelect.selectOption({ index: 0 });
  await page.getByLabel("Call Type").selectOption("Inbound");
  await page.getByLabel("Call Duration").fill("420");
  await page.getByRole("button", { name: "Save Call" }).click();

  const newestCallRow = page.locator("#calls-panel tbody tr").first();
  await expect(newestCallRow).toContainText(contactName?.trim() ?? "");
  await expect(newestCallRow).toContainText("Inbound");
});
