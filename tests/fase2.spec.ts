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

test("fase 2 creates a company and creates a related contact", async ({ page }) => {
  await page.context().addCookies([{ name: "crm_session", value: "active", url: "http://127.0.0.1:3000" }]);
  const unique = Date.now();
  const companyName = `Fase 2 Company ${unique}`;
  const contactName = `Fase 2 Contact ${unique}`;
  const email = `fase2.${unique}@example.com`;

  await page.goto("/companies");
  await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();

  await page.getByRole("button", { name: "Company" }).click();
  await page.getByLabel("Company Name").fill(companyName);
  await page.getByLabel("Phone").fill("+1-555-7744");
  await page.getByLabel("Website").fill("https://fase2-company.example");
  await page.getByRole("button", { name: "Save Company" }).click();

  await expect(page.getByRole("cell", { name: companyName, exact: true })).toBeVisible();
  await expect(page.getByLabel("Company detail panel")).toContainText(companyName);
  await page.getByLabel("Close company detail").click();

  await page.goto("/contacts");
  await expect(page.getByRole("heading", { name: "Contacts" })).toBeVisible();

  await page.getByRole("button", { name: "Contact" }).click();
  await page.getByLabel("Contact Name").fill(contactName);
  await page.getByLabel("Company Name").selectOption({ label: companyName });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Phone").fill("+1-555-8899");
  await page.getByRole("button", { name: "Save Contact" }).click();

  await expect(page.getByRole("cell", { name: contactName, exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: companyName, exact: true })).toBeVisible();
  await expect(page.getByLabel("Contact detail panel")).toContainText(contactName);
  await expect(page.getByLabel("Contact detail panel")).toContainText(companyName);
});
