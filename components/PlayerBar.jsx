"use client";
import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayerContext";
import { useLibrary } from "./LibraryContext";
import { fmt, gradientFor } from "../lib/format";
import {
  IconPlay,
  IconPause,
  IconPrev,
  IconNext,
  IconShuffle,
  IconRepeat,
  IconRepeatOne,
  IconVolume,
  IconVolumeMute,
  IconHeart,
  IconHeartOutline,
} from "./Icons";

export default function PlayerBar() {
  const p = usePlayer();
  const { toggleFavorite, isFavorite } = useLibrary();
  const t = p.current;

  const pr = useRef(p);
  useEffect(() => {
    pr.current = p;
  });

  // Горячие клавиши: пробел = пауза, Shift+стрелки = трек вперёд/назад
  useEffect(() => {
    function onKey(e) {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (tag === "BUTTON") e.target.blur();
        pr.current.togglePlay();
      } else if (e.shiftKey && e.key === "ArrowRight") {
        pr.current.next(false);
      } else if (e.shiftKey && e.key === "ArrowLeft") {
        pr.current.prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const max = Number.isFinite(p.duration) && p.duration > 0 ? p.duration : 30;
  const pct = (Math.min(p.progress, max) / max) * 100;

  return (
    <footer className="player">
      <div className="now">
        {t ? (
          <>
            {t.coverUrl ? (
              <img className="mini" src={t.coverUrl} alt="" />
            ) : (
              <div className="mini" style={{ background: gradientFor(t.id) }} />
            )}
            <div className="now-text">
              <div className="t">{t.title}</div>
              <div className="a">
                {p.error ? <span className="err">{p.error}</span> : t.artist}
              </div>
            </div>
            <button
              className={`like ${isFavorite(t.id) ? "on" : ""}`}
              onClick={() => toggleFavorite(t)}
              title="В любимые"
            >
              {isFavorite(t.id) ? <IconHeart /> : <IconHeartOutline />}
            </button>
          </>
        ) : (
          <div className="idle">Выбери трек, чтобы начать</div>
        )}
      </div>

      <div className="controls">
        <div className="buttons">
          <button
            className={`ctl opt ${p.shuffle ? "on" : ""}`}
            onClick={p.toggleShuffle}
            title="Перемешать"
          >
            <IconShuffle />
          </button>
          <button className="ctl" onClick={() => p.prev()} title="Назад">
            <IconPrev />
          </button>
          <button className="ctl play" onClick={p.togglePlay} title="Пауза / Play">
            {p.playing ? <IconPause /> : <IconPlay />}
          </button>
          <button className="ctl" onClick={() => p.next(false)} title="Дальше">
            <IconNext />
          </button>
          <button
            className={`ctl opt ${p.repeat !== "off" ? "on" : ""}`}
            onClick={p.cycleRepeat}
            title="Повтор"
          >
            {p.repeat === "one" ? <IconRepeatOne /> : <IconRepeat />}
          </button>
        </div>
        <div className="progress">
          <span>{fmt(p.progress)}</span>
          <input
            className="rng"
            type="range"
            min="0"
            max={max}
            step="0.1"
            value={Math.min(p.progress, max)}
            style={{ "--val": `${pct}%` }}
            onChange={(e) => p.seek(Number(e.target.value))}
          />
          <span>{fmt(p.duration)}</span>
        </div>
      </div>

      <div className="volume">
        <button
          className="ctl"
          onClick={() => p.setVolume(p.volume > 0 ? 0 : 0.7)}
          title="Звук"
        >
          {p.volume > 0 ? <IconVolume /> : <IconVolumeMute />}
        </button>
        <input
          className="rng"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={p.volume}
          style={{ "--val": `${p.volume * 100}%` }}
          onChange={(e) => p.setVolume(Number(e.target.value))}
        />
      </div>
    </footer>
  );
}