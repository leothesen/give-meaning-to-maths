import { test, expect } from "@playwright/test";

test("landing renders hero + voices", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Give Meaning",
  );
  await expect(page.getByText("For former pupils")).toBeVisible();
});

test("about renders", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("PeeBee");
});

test("/read shows preface; TOC and keyboard nav move chapters", async ({
  page,
}) => {
  await page.goto("/read");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Preface",
  );
  await page
    .getByRole("link", { name: "What is mathematics for?", exact: true })
    .click();
  await expect(page).toHaveURL(/\/read\/what-is-maths-for/);
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/\/read\/preface/);
});

test("unknown chapter 404s", async ({ page }) => {
  const res = await page.goto("/read/does-not-exist");
  expect(res?.status()).toBe(404);
});

test("theme toggle cycles System -> Light -> Dark", async ({ page }) => {
  await page.goto("/");
  const btn = page.getByRole("button", { name: "Toggle colour theme" });
  await expect(btn).toContainText("System");
  await btn.click();
  await expect(btn).toContainText("Light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await btn.click();
  await expect(btn).toContainText("Dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("llms.txt is served as text and lists chapters", async ({ page }) => {
  const res = await page.goto("/llms.txt");
  expect(res?.ok()).toBeTruthy();
  expect(await res!.text()).toContain("## Chapters");
});
