"use client";
import { useEffect } from "react";
import { usePlayer } from "./PlayerContext";

export default function MediaSession() {
  const { current, playing, togglePlay, next, prev } = usePlayer();

  useEffect(() => {
    if (!navigator.mediaSession) return;

    const t = current;

    navigator.mediaSession.metadata = t
      ? new MediaMetadata({
          title: t.title,
          artist: t.artist,
          album: t.album || "",
          artwork: t.coverUrl
            ? [{ src: t.coverUrl, sizes: "512x512", type: "image/jpeg" }]
            : [],
        })
      : null;

    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("previoustrack", () => prev());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.metadata = null;
    };
  }, [current, playing, togglePlay, next, prev]);

  return null;
}