import { expect, test } from "@playwright/test";

/**
 * Ende-zu-Ende gegen eine echte Supabase-Instanz (Werte aus .env.local).
 * Achtung: legt Daten an – nur gegen eine Entwicklungs-Datenbank laufen lassen.
 */
test("Login → Queen-Erfassung → Dashboard → Event anlegen und abhaken", async ({ page }) => {
  const password = process.env.APP_PASSWORD;
  test.skip(!password, "APP_PASSWORD ist nicht gesetzt");

  // Ohne Login landet man auf /login
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("Passwort").fill(password!);
  await page.getByRole("button", { name: "Anmelden" }).click();
  await expect(page).toHaveURL(/\/$/);

  // Queen-Erfassung: Emotionalität auf 8 setzen
  await page.goto("/queen");
  const target = 8;
  const thumb = page.getByRole("slider", { name: "Grad Emotionalität" });
  await thumb.focus();
  await page.keyboard.press("Home");
  for (let i = 1; i < target; i++) await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("emotionality-value")).toHaveText(String(target));

  await page.getByRole("button", { name: /Speichern|Werte aktualisieren/ }).click();
  await expect(page.getByText(/Werte für den .* (gespeichert|aktualisiert)/)).toBeVisible();

  // Wert erscheint im Dashboard
  await page.getByRole("link", { name: "Zum Dashboard" }).click();
  await expect(page.getByTestId("kpi-emotionality-latest")).toHaveText(String(target));

  // Event anlegen und abhaken
  await page.goto("/events");
  const title = `E2E-Event ${Date.now()}`;
  await page.getByLabel("Eventbezeichnung", { exact: true }).fill(title);
  await page.getByRole("button", { name: "Hinzufügen" }).click();

  const row = page.getByTestId("event-row").filter({ has: page.locator(`input[value="${title}"]`) });
  await expect(row).toHaveCount(1);
  await row.getByRole("checkbox").click();
  await expect(row.getByRole("checkbox")).toHaveAttribute("data-state", "checked");

  // Nach Neuladen weiterhin erledigt
  await page.reload();
  const reloaded = page.getByTestId("event-row").filter({ has: page.locator(`input[value="${title}"]`) });
  await expect(reloaded.getByRole("checkbox")).toHaveAttribute("data-state", "checked");

  // Aufräumen
  await reloaded.getByRole("button", { name: "Event löschen" }).click();
  await page.getByRole("button", { name: "Löschen" }).click();
  await expect(reloaded).toHaveCount(0);
});
