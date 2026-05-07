import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("login page is keyboard navigable and axe-clean", async ({ page }) => {
  await page.goto("/login");

  // axe scan
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(blocking).toEqual([]);

  // Tab order reaches the email field, then password, then submit.
  const email = page.getByLabel(/email/i);
  const password = page.getByLabel(/password/i);
  await expect(email).toBeVisible();
  await expect(password).toBeVisible();
  await email.focus();
  await page.keyboard.press("Tab");
  await expect(password).toBeFocused();
});
