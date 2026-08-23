import { getInquiries, saveInquiries } from "@/lib/data-manager";
import type { ContactInquiry } from "@/lib/data-manager";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<Pick<ContactInquiry, "status">>;
    const inquiries = await getInquiries();
    const index = inquiries.findIndex((i) => i.id === id);
    if (index === -1) return Response.json({ error: "Not found" }, { status: 404 });

    if (body.status) inquiries[index] = { ...inquiries[index], status: body.status };
    await saveInquiries(inquiries);
    return Response.json(inquiries[index]);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inquiries = await getInquiries();
    const filtered = inquiries.filter((i) => i.id !== id);
    if (filtered.length === inquiries.length) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    await saveInquiries(filtered);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
