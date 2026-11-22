import { NextResponse } from "next/server";
import { PRESETS } from "../../../lib/presets";
import { searchYouTube } from "../../../lib/youtube";

export async function GET(request) {
  const params = new URL(request.url).searchParams;

  try {
    const artist = params.get("artist")?.trim();

    if (artist) {
      const tracks = await searchYouTube(`${artist} official music`, 30);

      return NextResponse.json({
        name: artist,
        tracks,
      });
    }

    const preset = PRESETS.find(
      (item) => item.key === params.get("preset")
    );

    if (!preset) {
      return NextResponse.json(
        { error: "Unknown catalog preset" },
        { status: 400 }
      );
    }

    const tracks = await searchYouTube(
      preset.q || preset.key,
      30
    );

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("[api/catalog]", error);
    return NextResponse.json(
      { error: error.message },
      { status: 502 }
    );
  }
}
