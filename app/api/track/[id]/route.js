import { mapTrack } from "../../../../lib/deezer";

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const res = await fetch(`https://api.deezer.com/track/${id}`, {
      cache: "no-store",
    });
    const t = await res.json();
    if (t.error) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json(mapTrack(t));
  } catch {
    return Response.json({ error: "failed" }, { status: 502 });
  }
}