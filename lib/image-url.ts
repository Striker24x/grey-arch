import "server-only";
import { readJsonSync } from "./data-manager";

/**
 * Resolve a local public-image path (e.g. /images/grey-arch/hero/hero-home.jpg)
 * to its Cloudinary URL. Falls back to the original path if not yet migrated.
 */
export async function getImageUrl(localPath: string): Promise<string> {
  const map = await readJsonSync<Record<string, string>>("image-map.json");
  return map?.[localPath] ?? localPath;
}
