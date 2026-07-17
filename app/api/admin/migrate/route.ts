import { existsSync } from "fs";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { uploadLocalFile, deriveCloudinaryParams } from "@/lib/cloudinary";
import {
  readJsonSync,
  writeJsonSync,
  getProjects,
  saveProjects,
  getGallery,
  saveGallery,
} from "@/lib/data-manager";

export const maxDuration = 60; // allow up to 60 s for the migration

export async function POST() {
  const publicDir = join(process.cwd(), "public");
  const imageMap: Record<string, string> = readJsonSync("image-map.json") ?? {};

  // Collect every local image under public/images/grey-arch
  const { readdirSync, statSync } = await import("fs");
  function walk(dir: string, base: string): string[] {
    const results: string[] = [];
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        results.push(...walk(full, base));
      } else if (/\.(jpe?g|png|webp|avif)$/i.test(name)) {
        results.push(full.replace(base, "").replace(/\\/g, "/"));
      }
    }
    return results;
  }

  const greyArchDir = join(publicDir, "images", "grey-arch");
  const allLocalPaths = existsSync(greyArchDir) ? walk(greyArchDir, publicDir) : [];

  const results = {
    migrated: 0,
    skipped: 0,
    errors: [] as string[],
    map: imageMap,
  };

  for (const localPath of allLocalPaths) {
    if (imageMap[localPath]) {
      results.skipped++;
      continue;
    }

    const fullPath = join(publicDir, localPath);
    if (!existsSync(fullPath)) {
      results.errors.push(`File not found: ${localPath}`);
      continue;
    }

    try {
      const { folder, publicId } = deriveCloudinaryParams(localPath);
      const url = await uploadLocalFile(fullPath, folder, publicId);
      imageMap[localPath] = url;
      results.migrated++;
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : JSON.stringify(err);
      results.errors.push(`${localPath}: ${msg}`);
    }
  }

  // Persist the map
  writeJsonSync("image-map.json", imageMap);

  // Patch projects.json URLs
  const projects = await getProjects();
  const patchedProjects = projects.map((p) => ({
    ...p,
    image: imageMap[p.image] ?? p.image,
    galleryImages: p.galleryImages.map((img) => imageMap[img] ?? img),
  }));
  saveProjects(patchedProjects);

  // Patch gallery.json URLs
  const gallery = await getGallery();
  const patchedGallery = gallery.map((g) => ({
    ...g,
    image: imageMap[g.image] ?? g.image,
  }));
  saveGallery(patchedGallery);

  // Bust all caches
  revalidatePath("/[lang]", "layout");

  results.map = imageMap;
  return Response.json(results);
}

/** Return current migration status */
export async function GET() {
  const imageMap: Record<string, string> = readJsonSync("image-map.json") ?? {};
  return Response.json({
    total: Object.keys(imageMap).length,
    map: imageMap,
  });
}
