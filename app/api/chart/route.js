import { mapTrack } from "../../../lib/deezer";

export async function GET() {
  try {
    const res = await fetch("https://api.deezer.com/chart/0/tracks?limit=20", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return Response.json((data.data || []).map(mapTrack));
  } catch {
    return Response.json([], { status: 502 });
  }
}