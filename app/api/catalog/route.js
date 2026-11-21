import { mapTrack } from "../../../lib/deezer";
import { PRESETS } from "../../../lib/presets";

async function getJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export async function GET(request) {
  const sp = new URL(request.url).searchParams;

  try {
    const artistQ = sp.get("artist");
    if (artistQ) {
      const found = await getJson(
        `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistQ)}&limit=1`
      );
      const a = found.data && found.data[0];
      if (!a) return Response.json({ name: artistQ, tracks: [] });
      const top = await getJson(`https://api.deezer.com/artist/${a.id}/top?limit=50`);
      return Response.json({
        name: a.name,
        tracks: (top.data || []).map(mapTrack).filter((t) => t.preview),
      });
    }

    const preset = PRESETS.find((p) => p.key === sp.get("preset"));
    if (!preset) return Response.json([], { status: 400 });

    const url =
      preset.chart !== undefined
        ? `https://api.deezer.com/chart/${preset.chart}/tracks?limit=100`
        : `https://api.deezer.com/search?q=${encodeURIComponent(preset.q)}&order=RANKING&limit=100`;
    const data = await getJson(url);
    return Response.json((data.data || []).map(mapTrack).filter((t) => t.preview));
  } catch {
    return Response.json([], { status: 502 });
  }
}