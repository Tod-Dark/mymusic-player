import { NextResponse } from "next/server";
import { searchYouTube } from "../../../lib/youtube";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) return NextResponse.json([]);

  try {
    const tracks = await searchYouTube(q, 20);
    return NextResponse.json(tracks);
  } catch (error) {
    console.error("[api/search]", error);
    return NextResponse.json(
      { error: error.message },
      { status: 502 }
    );
  }
}
