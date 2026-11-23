const API_KEY = process.env.YOUTUBE_API_KEY;

function parseDuration(iso) {
  const match = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return 0;

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

export async function searchYouTube(query, maxResults = 20) {
  if (!API_KEY) {
    throw new Error("YOUTUBE_API_KEY отсутствует");
  }

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: String(maxResults),
    q: query,
    videoCategoryId: "10",
    key: API_KEY,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("[YouTube Search API]", response.status, error);
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  const items = (data.items || []).filter((item) => item.id?.videoId);

  if (!items.length) return [];

  const ids = items.map((item) => item.id.videoId);

  const detailsParams = new URLSearchParams({
    part: "contentDetails",
    id: ids.join(","),
    key: API_KEY,
  });

  const detailsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${detailsParams}`,
    { cache: "no-store" }
  );

  if (!detailsResponse.ok) {
    const error = await detailsResponse.text();
    console.error("[YouTube Videos API]", detailsResponse.status, error);
    throw new Error(`YouTube Videos API error: ${detailsResponse.status}`);
  }

  const detailsData = await detailsResponse.json();

  const durations = new Map(
    (detailsData.items || []).map((video) => [
      video.id,
      parseDuration(video.contentDetails?.duration),
    ])
  );

  return items.map((item) => {
    const videoId = item.id.videoId;

    return {
      id: `yt-${videoId}`,
      externalId: videoId,
      videoId,
      title: item.snippet?.title || "Unknown",
      artist: item.snippet?.channelTitle || "YouTube",
      album: "YouTube",
      coverUrl:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        "",
      duration: durations.get(videoId) || 0,
      source: "youtube",
    };
  });
}

export async function findYouTubeId(title, artist) {
  const results = await searchYouTube(`${title} ${artist}`.trim(), 5);
  return results[0]?.videoId || null;
}