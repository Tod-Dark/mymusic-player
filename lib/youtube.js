import { AUDIUS_API } from "./audius";

function mapAudiusTrack(t) {
  if (!t || t.is_streamable === false) return null;
  return {
    id: `audius:${t.id}`,
    externalId: String(t.id),
    source: "audius",
    title: t.title || "Unknown",
    artist: t.user?.name || "Unknown",
    album: "",
    coverUrl: t.artwork?.["480x480"] || t.artwork?.["150x150"] || "",
    duration: t.duration || 0,
  };
}

export async function searchYouTube(query, maxResults = 20) {
  const res = await fetch(
    `${AUDIUS_API}/tracks/search?query=${encodeURIComponent(query)}&limit=${maxResults}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(`Audius API error: ${res.status}`);
  }

  const data = await res.json();
  const tracks = (data.data || []).map(mapAudiusTrack).filter(Boolean);
  return tracks;
}

export async function findYouTubeId(title, artist) {
  const results = await searchYouTube(`${title} ${artist}`.trim(), 5);
  return results[0]?.externalId || null;
}