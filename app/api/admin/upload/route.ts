import { uploadBuffer } from "@/lib/cloudinary";
import { readJsonSync, writeJsonSync } from "@/lib/data-manager";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function extOf(filename: string) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

/** Map a folder hint like "images/grey-arch/portfolio" → "grey-arch/portfolio" */
function toCloudinaryFolder(folder: string) {
  return folder.replace(/^images\//, "").replace(/^\/+/, "");
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return Response.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  const ext = extOf(file.name);
  if (!ALLOWED_EXT.has(ext)) {
    return Response.json({ error: "File type not allowed" }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }

  const folderHint = (formData.get("folder") as string) || "grey-arch/uploads";
  const folder = toCloudinaryFolder(folderHint);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const url = await uploadBuffer(buffer, folder);

  // Add to image-map so getDictionary can resolve it
  const imageMap: Record<string, string> = readJsonSync("image-map.json") ?? {};
  imageMap[url] = url; // identity entry so Cloudinary URLs pass through unchanged
  writeJsonSync("image-map.json", imageMap);

  return Response.json({ url }, { status: 201 });
}

