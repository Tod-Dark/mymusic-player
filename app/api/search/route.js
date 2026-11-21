import { NextResponse } from "next/server";
import { mapTrack } from "../../../lib/deezer";
import { AUDIUS_API, AUDIUS_APP, mapAudius } from "../../../lib/audius";

const YOUTUBE_KEY = process.env.YOUTUBE_API_KEY;

async function searchYouTube(q) {
  if (!YOUTUBE_KEY) {
    throw new Error("Нет YOUTUBE_API_KEY в .env.local");
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(
    q
  )}&key=${YOUTUBE_KEY}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    console.error("[search/youtube]", res.status, body);
    throw new Error("YouTube API ошибка " + res.status);
  }

  const data = await res.json();
  return (data.items || [])
    .map((item) => {
      const videoId = item.id?.videoId;
      if (!videoId) return null;
      return {
        id: `yt-${videoId}`,
        externalId: videoId,
        videoId,
        title: item.snippet?.title || "Без названия",
        artist: item.snippet?.channelTitle || "YouTube",
        album: "YouTube",
        coverUrl:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",
        duration: 0,
        source: "youtube",
      };
    })
    .filter(Boolean);
}

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const q = sp.get("q") || "";
  const source = sp.get("source") || "audius";

  try {
    if (source === "audius") {
      const url = q
        ? `${AUDIUS_API}/tracks/search?query=${encodeURIComponent(q)}&limit=30&app_name=${AUDIUS_APP}`
        : `${AUDIUS_API}/tracks/trending?limit=20&app_name=${AUDIUS_APP}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return NextResponse.json([], { status: 502 });
      const data = await res.json();
      return NextResponse.json((data.data || []).map(mapAudius).filter(Boolean));
    }

    if (source === "youtube") {
      if (!q.trim()) return NextResponse.json([]);
      const items = await searchYouTube(q);
      return NextResponse.json(items);
    }

    if (!q) return NextResponse.json([]);
    const res = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=30`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json((data.data || []).map(mapTrack));
  } catch (err) {
    console.error("[api/search]", err);
    return NextResponse.json([], { status: 502 });
  }
}