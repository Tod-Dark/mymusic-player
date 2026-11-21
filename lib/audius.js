export const AUDIUS_API = "https://api.audius.co/v1";
export const AUDIUS_APP = "MyMusic";

export function mapAudius(t) {
  if (!t || t.is_streamable === false) return null;
  return {
    id: `audius:${t.id}`,
    externalId: String(t.id),
    source: "audius",
    title: t.title,
    artist: t.user?.name || "Unknown",
    album: "",
    coverUrl: t.artwork?.["480x480"] || t.artwork?.["150x150"] || "",
    duration: t.duration || 0,
  };
}