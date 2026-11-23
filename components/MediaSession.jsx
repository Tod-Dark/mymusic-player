"use client";
import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayerContext";

export default function MediaSession() {
  const { current, playing, togglePlay, next, prev, progress, duration } =
    usePlayer();
  const prevPlaying = useRef(playing);

  useEffect(() => {
    if (!navigator.mediaSession) return;

    const t = current;

    if (t) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: t.artist,
        album: t.album || "",
        artwork: t.coverUrl
          ? [{ src: t.coverUrl, sizes: "512x512", type: "image/jpeg" }]
          : [],
      });

      navigator.mediaSession.playbackState = playing ? "playing" : "paused";

      if (Number.isFinite(duration) && duration > 0) {
        navigator.mediaSession.positionState = {
          duration,
          playbackRate: 1,
          position: progress,
        };
      }
    } else {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "paused";
      navigator.mediaSession.positionState = null;
    }

    const handlers = {
      play: () => togglePlay(),
      pause: () => togglePlay(),
      previoustrack: () => prev(),
      nexttrack: () => next(),
    };

    Object.entries(handlers).forEach(([action, handler]) => {
      navigator.mediaSession.setActionHandler(action, handler);
    });

    return () => {
      Object.keys(handlers).forEach((action) => {
        navigator.mediaSession.setActionHandler(action, null);
      });
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "paused";
      navigator.mediaSession.positionState = null;
    };
  }, [current, playing, progress, duration, togglePlay, next, prev]);

  // Поддерживаем актуальное состояние при смене трека / паузы
  useEffect(() => {
    if (!navigator.mediaSession) return;
    if (prevPlaying.current !== playing && current) {
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    }
    prevPlaying.current = playing;
  }, [playing, current]);

  return null;
}