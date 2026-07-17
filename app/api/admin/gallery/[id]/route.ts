import { revalidatePath } from "next/cache";
import { getGallery, saveGallery } from "@/lib/data-manager";
import type { GalleryRecord } from "@/lib/data-manager";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as GalleryRecord;
  const gallery = await getGallery();
  const index = gallery.findIndex((g) => g.id === id);
  if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });

  gallery[index] = { ...body, id };
  saveGallery(gallery);
  revalidatePath("/[lang]/gallery", "page");
  return Response.json(gallery[index]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const gallery = await getGallery();
  const filtered = gallery.filter((g) => g.id !== id);
  if (filtered.length === gallery.length) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  saveGallery(filtered);
  revalidatePath("/[lang]/gallery", "page");
  return Response.json({ ok: true });
}
