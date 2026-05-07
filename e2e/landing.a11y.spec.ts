import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page has no serious or critical a11y violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  if (blocking.length) {
    console.log("Violations:", JSON.stringify(blocking, null, 2));
  }
  expect(blocking).toEqual([]);
});
