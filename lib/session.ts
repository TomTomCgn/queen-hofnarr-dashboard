/**
 * Signierte Session-Cookies (HMAC-SHA256) mit Web Crypto –
 * funktioniert sowohl in der Edge-Middleware als auch in Node.
 */

export const SESSION_COOKIE = "qh_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 Tage

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function getSecret(secret?: string): string {
  const value = secret ?? process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET fehlt oder ist kürzer als 32 Zeichen.");
  }
  return value;
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Erstellt einen Token `<ablauf>.<signatur>`. */
export async function createSessionToken(now = Date.now(), secret?: string): Promise<string> {
  const expires = Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `v1.${expires}`;
  return `${payload}.${await hmac(getSecret(secret), payload)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  now = Date.now(),
  secret?: string,
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires * 1000 < now) return false;
  let resolvedSecret: string;
  try {
    resolvedSecret = getSecret(secret);
  } catch {
    return false;
  }
  const expected = await hmac(resolvedSecret, `${parts[0]}.${parts[1]}`);
  return timingSafeEqual(expected, parts[2]);
}

/** Vergleicht das eingegebene Passwort mit APP_PASSWORD, ohne Längen-/Timing-Leck. */
export async function checkPassword(input: string, expected = process.env.APP_PASSWORD): Promise<boolean> {
  if (!expected) return false;
  const secret = getSecret();
  const [a, b] = await Promise.all([hmac(secret, input), hmac(secret, expected)]);
  return timingSafeEqual(a, b);
}
