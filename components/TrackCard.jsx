"use client";
import { usePlayer } from "./PlayerContext";
import { gradientFor } from "../lib/format";
import { IconPlay, IconPause } from "./Icons";

export default function TrackCard({ track, list, index }) {
  const { playQueue, current, playing, togglePlay } = usePlayer();
  const active = current?.id === track.id;

  return (
    <div
      className="tcard"
      onClick={() => (active ? togglePlay() : playQueue(list, index))}
    >
      <div className="tcard-cover">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt="" />
        ) : (
          <div className="ph" style={{ background: gradientFor(track.id) }} />
        )}
        <button className={`fab ${active && playing ? "show" : ""}`}>
          {active && playing ? <IconPause /> : <IconPlay />}
        </button>
      </div>
      <div className="tcard-title">{track.title}</div>
      <div className="tcard-sub">{track.artist}</div>
    </div>
  );
}