import "server-only";

import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/** Zusätzliche Prüfung in Server Actions (zur Middleware). */
export async function requireSession(): Promise<void> {
  const store = await cookies();
  if (!(await verifySessionToken(store.get(SESSION_COOKIE)?.value))) {
    throw new Error("Nicht angemeldet.");
  }
}
