import { revalidatePath } from "next/cache";
import { getProjects, saveProjects } from "@/lib/data-manager";

function tryRevalidate(path: string, type?: "layout" | "page") {
  try { revalidatePath(path, type); } catch { /* non-critical in dev */ }
}

/**
 * Persists a new project ORDER (array of slugs, top-to-bottom = website order).
 * The order is shared across all languages because it reorders the single
 * underlying ProjectRecord[] array that every locale's dictionary is built from.
 */
export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { order: string[] };
    if (!Array.isArray(body.order)) {
      return Response.json({ error: "Invalid payload: expected { order: string[] }" }, { status: 400 });
    }

    const projects = await getProjects();
    const bySlug = new Map(projects.map((p) => [p.slug, p]));

    if (body.order.length !== projects.length || body.order.some((slug) => !bySlug.has(slug))) {
      return Response.json({ error: "Order must contain exactly the existing project slugs" }, { status: 400 });
    }

    const reordered = body.order.map((slug) => bySlug.get(slug)!);
    await saveProjects(reordered);

    tryRevalidate("/[lang]/portfolio", "page");
    tryRevalidate("/[lang]", "page");

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
