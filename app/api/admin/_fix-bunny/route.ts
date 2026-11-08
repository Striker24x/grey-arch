import { readJsonSync, writeJsonSync } from "@/lib/data-manager";
import { revalidatePath } from "next/cache";

// ONE-OFF maintenance endpoint: the "gallery" and "image-map" site_data docs
// pre-date the admin CRUD UI and have no management page. This clears any
// dead Bunny CDN (b-cdn.net) references left over from the pre-R2 migration.
// Delete this file after running it once.
export async function POST(request: Request) {
  const auth = request.headers.get("x-fix-key");
  if (auth !== "grey-arch-bunny-cleanup-2026") {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const report: Record<string, unknown> = {};

  const gallery = await readJsonSync<Array<{ id: string; image: string; translations: unknown }>>(
    "gallery.json"
  );
  report.galleryBefore = gallery;
  if (gallery) {
    let changed = false;
    for (const item of gallery) {
      if (item.image && item.image.includes("b-cdn.net")) {
        item.image = "";
        changed = true;
      }
    }
    if (changed) await writeJsonSync("gallery.json", gallery);
    report.galleryChanged = changed;
  }

  const imageMap = await readJsonSync<Record<string, string>>("image-map.json");
  report.imageMapEntries = imageMap ? Object.keys(imageMap).length : 0;
  if (imageMap) {
    let changed = false;
    for (const key of Object.keys(imageMap)) {
      if (imageMap[key] && imageMap[key].includes("b-cdn.net")) {
        delete imageMap[key];
        changed = true;
      }
    }
    if (changed) await writeJsonSync("image-map.json", imageMap);
    report.imageMapChanged = changed;
  }

  try {
    revalidatePath("/", "layout");
  } catch {
    /* non-critical */
  }

  return Response.json(report);
}
