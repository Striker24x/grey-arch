import { cookies } from "next/headers";
import { SESSION_COOKIE, checkAdminPassword, createSessionToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || !checkAdminPassword(password)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
