import { findYouTubeId } from "../../../lib/youtube";

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const title = sp.get("title") || "";
  const artist = sp.get("artist") || "";
  if (!title) return Response.json({ error: "no title" }, { status: 400 });
  try {
    const videoId = await findYouTubeId(title, artist);
    return Response.json({ videoId });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 502 });
  }
}