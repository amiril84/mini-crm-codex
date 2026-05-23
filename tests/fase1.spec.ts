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

test("fase 1 layout renders sidebar navigation and top bar", async ({ page }) => {
  await page.context().addCookies([{ name: "crm_session", value: "active", url: "http://127.0.0.1:3000" }]);
  await page.goto("/");

  await expect(page).toHaveTitle(/Mini CRM/);
  await expect(page.getByLabel("Sidebar navigation")).toBeVisible();

  for (const item of ["Dashboard", "Deals", "Contacts", "Companies", "Products", "Activities"]) {
    await expect(page.getByRole("link", { name: item })).toBeVisible();
  }

  await expect(page.getByLabel("Search")).toBeVisible();
  await expect(page.getByLabel("Notifications")).toBeVisible();
  await expect(page.getByLabel("Billing")).toBeVisible();
  await expect(page.getByLabel("Settings")).toBeVisible();
  await expect(page.getByLabel("User profile")).toBeVisible();
});
