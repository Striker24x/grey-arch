import { getInquiries } from "@/lib/data-manager";

export async function GET() {
  try {
    const inquiries = await getInquiries();
    // Most recent first
    const sorted = [...inquiries].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return Response.json(sorted);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
