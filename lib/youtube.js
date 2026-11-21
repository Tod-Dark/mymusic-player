const KEY = process.env.YOUTUBE_API_KEY;

export async function findYouTubeId(title, artist) {
  if (!KEY) throw new Error("Нет YOUTUBE_API_KEY в .env.local");
  const q = [artist, title].filter(Boolean).join(" ");
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
    q
  )}&key=${KEY}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    console.error("[youtube]", res.status, body);
    throw new Error("YouTube API ошибка " + res.status);
  }
  const data = await res.json();
  const item = data.items && data.items[0];
  if (!item) throw new Error("Видео не найдено");
  return item.id.videoId;
}