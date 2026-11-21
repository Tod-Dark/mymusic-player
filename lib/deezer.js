export function mapTrack(t) {
  return {
    id: `deezer:${t.id}`,
    externalId: String(t.id),
    source: "deezer",
    title: t.title,
    artist: t.artist?.name || "Unknown",
    album: t.album?.title || "",
    coverUrl: t.album?.cover_medium || t.album?.cover || "",
    duration: t.duration || 0,
    preview: t.preview || "",
  };
}