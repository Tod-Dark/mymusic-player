import { NextResponse } from "next/server";
import { searchYouTube } from "../../../lib/youtube";

export async function GET() {
  try {
    const tracks = await searchYouTube("popular music official music video", 20);
    return NextResponse.json(tracks);
  } catch (error) {
    console.error("[api/chart]", error);
    return NextResponse.json(
      { error: error.message },
      { status: 502 }
    );
  }
}
