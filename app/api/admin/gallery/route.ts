import { revalidatePath } from "next/cache";
import { getGallery, saveGallery } from "@/lib/data-manager";
import type { GalleryRecord } from "@/lib/data-manager";

export async function GET() {
  const gallery = await getGallery();
  return Response.json(gallery);
}

export async function POST(request: Request) {
  const body = (await request.json()) as GalleryRecord;
  const gallery = await getGallery();

  if (!body.id) body.id = `gallery-${Date.now()}`;
  gallery.push(body);
  saveGallery(gallery);
  revalidatePath("/[lang]/gallery", "page");

  return Response.json(body, { status: 201 });
}
