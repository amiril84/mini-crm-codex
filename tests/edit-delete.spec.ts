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

test.beforeEach(async ({ page }) => {
  await page.context().addCookies([{ name: "crm_session", value: "active", url: "http://127.0.0.1:3000" }]);
});

test("edits and deletes a company", async ({ page }) => {
  const unique = Date.now();
  const companyName = `Editable Company ${unique}`;
  const updatedCompanyName = `${companyName} Updated`;

  await page.goto("/companies");
  await page.getByRole("button", { name: "Company" }).click();
  await page.getByLabel("Company Name").fill(companyName);
  await page.getByLabel("Phone").fill("+1-555-3300");
  await page.getByLabel("Website").fill("https://editable-company.example");
  await page.getByRole("button", { name: "Save Company" }).click();

  await expect(page.getByLabel("Company detail panel")).toContainText(companyName);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Company Name").fill(updatedCompanyName);
  await page.getByRole("button", { name: "Update Company" }).click();

  await expect(page.getByRole("cell", { name: updatedCompanyName, exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("cell", { name: updatedCompanyName, exact: true })).toHaveCount(0);
});

test("edits and deletes a contact", async ({ page }) => {
  const unique = Date.now();
  const contactName = `Editable Contact ${unique}`;
  const updatedContactName = `${contactName} Updated`;

  await page.goto("/contacts");
  await page.getByRole("button", { name: "Contact" }).click();
  await page.getByLabel("Contact Name").fill(contactName);
  await page.getByLabel("Email").fill(`editable.${unique}@example.com`);
  await page.getByLabel("Phone").fill("+1-555-4400");
  await page.getByRole("button", { name: "Save Contact" }).click();

  await expect(page.getByLabel("Contact detail panel")).toContainText(contactName);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Contact Name").fill(updatedContactName);
  await page.getByRole("button", { name: "Update Contact" }).click();

  await expect(page.getByRole("cell", { name: updatedContactName, exact: true })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("cell", { name: updatedContactName, exact: true })).toHaveCount(0);
});

test("edits and deletes a deal", async ({ page }) => {
  const unique = Date.now();
  const dealName = `Editable Deal ${unique}`;
  const updatedDealName = `${dealName} Updated`;

  await page.goto("/deals");
  await page.getByRole("button", { name: "Deal" }).click();
  await page.getByLabel("Deal Name").fill(dealName);
  await page.getByLabel("Amount").fill("1357");
  await page.getByLabel("Stage").selectOption("Needs Analysis");
  await page.getByRole("button", { name: "Save Deal" }).click();

  await expect(page.getByLabel("Deal detail panel")).toContainText(dealName);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Deal Name").fill(updatedDealName);
  await page.getByLabel("Amount").fill("2468");
  await page.getByLabel("Stage").selectOption("Negotiation");
  await page.getByRole("button", { name: "Update Deal" }).click();

  await expect(page.getByTestId("stage-Negotiation")).toContainText(updatedDealName);
  await expect(page.getByLabel("Deal detail panel")).toContainText("$2,468");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText(updatedDealName)).toHaveCount(0);
});
