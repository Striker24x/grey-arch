export const SESSION_COOKIE = "ga_admin";

const DEFAULT_SECRET = "grey-arch-change-in-production";

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? DEFAULT_SECRET;
}

async function hmacHex(value: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function b64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (base64.length % 4)) % 4;
  const binary = atob(base64 + "=".repeat(padding));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export async function createSessionToken(): Promise<string> {
  const payload = `admin:${Date.now()}`;
  const sig = await hmacHex(payload, getSecret());
  return b64urlEncode(`${payload}.${sig}`);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const decoded = b64urlDecode(token);
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) return false;
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expected = await hmacHex(payload, getSecret());
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "admin123";
  if (password.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < password.length; i++) diff |= password.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
