import { describe, expect, it } from "vitest";

import { createSessionToken, SESSION_MAX_AGE_SECONDS, verifySessionToken } from "@/lib/session";

const secret = "test-secret-mindestens-32-zeichen-lang!";

describe("Session-Token", () => {
  it("akzeptiert eigene Tokens", async () => {
    const token = await createSessionToken(Date.now(), secret);
    expect(await verifySessionToken(token, Date.now(), secret)).toBe(true);
  });

  it("lehnt manipulierte, fremde und abgelaufene Tokens ab", async () => {
    const now = Date.now();
    const token = await createSessionToken(now, secret);
    const [v, exp, sig] = token.split(".");
    expect(await verifySessionToken(`${v}.${Number(exp) + 999}.${sig}`, now, secret)).toBe(false);
    expect(await verifySessionToken(token, now, secret.replace("t", "x"))).toBe(false);
    expect(await verifySessionToken(token, now + (SESSION_MAX_AGE_SECONDS + 1) * 1000, secret)).toBe(false);
    expect(await verifySessionToken(undefined, now, secret)).toBe(false);
  });
});
