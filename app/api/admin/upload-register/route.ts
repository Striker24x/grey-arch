import { readJsonSync, writeJsonSync } from "@/lib/data-manager";

/**
 * Registers a Cloudinary URL (already uploaded directly from the browser, see
 * lib/client-upload.ts) in image-map.json — an identity entry so getDictionary/
 * getImageUrl continue to resolve Cloudinary URLs unchanged. Only ever receives a
 * small JSON payload, never file bytes, so it's unaffected by Vercel's body-size cap.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { url?: string } | null;
  if (!body?.url) return Response.json({ error: "No url provided" }, { status: 400 });

  const imageMap: Record<string, string> = (await readJsonSync("image-map.json")) ?? {};
  imageMap[body.url] = body.url;
  await writeJsonSync("image-map.json", imageMap);

  return Response.json({ ok: true });
}
