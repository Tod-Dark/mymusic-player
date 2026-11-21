import { NextResponse } from "next/server";

const KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ error: "no query" }, { status: 400 });
  }
  if (!KEY) {
    return NextResponse.json({ error: "Нет YOUTUBE_API_KEY в .env.local" }, { status: 500 });
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(
    q
  )}&key=${KEY}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text();
      console.error("[youtube/search]", res.status, body);
      return NextResponse.json({ error: "YouTube API ошибка " + res.status }, { status: 502 });
    }

    const data = await res.json();
    const items = (data.items || []).map((item) => ({
      id: item.id?.videoId,
      videoId: item.id?.videoId,
      title: item.snippet?.title || "Без названия",
      artist: item.snippet?.channelTitle || "YouTube",
      cover: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
      source: "youtube",
    }));

    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}