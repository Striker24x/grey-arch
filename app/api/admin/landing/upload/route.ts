import { uploadBuffer } from "@/lib/cloudinary";

const ALLOWED_EXT = new Set([".mp4", ".webm", ".mov", ".ogg"]);
const MAX_SIZE = 200 * 1024 * 1024; // 200 MB

function extOf(filename: string) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return Response.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  const ext = extOf(file.name);
  if (!ALLOWED_EXT.has(ext)) {
    return Response.json({ error: "Nur MP4, WebM, MOV oder OGG erlaubt" }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "Datei zu groß (max 200 MB)" }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const url = await uploadBuffer(buffer, "grey-arch/landing-videos");

  return Response.json({ url }, { status: 201 });
}
