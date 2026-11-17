// ============================================================================
// STILLGELEGT (deaktiviert) — alte Video-Slider-Landing-Page: API-Route
// Ursprünglich: app/api/admin/landing/route.ts
// Der Code ist absichtlich auskommentiert und NICHT gelöscht, damit er später
// wieder aktiviert werden kann (Kommentarzeichen entfernen + Datei zurückverschieben).
// Ersetzt durch: neue Landing-Page-Verwaltung (lib/landing-page.ts, /admin/landing).
// ============================================================================

// import { revalidatePath } from "next/cache";
// import { getLanding, saveLanding } from "@/lib/data-manager";
// import type { LandingData } from "@/lib/data-manager";
//
// export async function GET() {
//   try {
//     return Response.json(await getLanding());
//   } catch (err) {
//     return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
//   }
// }
//
// export async function PUT(request: Request) {
//   try {
//     const body = (await request.json()) as LandingData;
//     await saveLanding(body);
//     revalidatePath("/[lang]", "page");
//     return Response.json(body);
//   } catch (err) {
//     return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
//   }
// }

export {};
