"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLibrary } from "../components/LibraryContext";
import { usePlayer } from "../components/PlayerContext";
import TrackCard from "../components/TrackCard";
import { IconHeart, IconPlay } from "../components/Icons";
import { gradientFor } from "../lib/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}


async function loadChart() {
  try {
    const r = await fetch("/api/chart");
    if (!r.ok) return [];

    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Ошибка загрузки подборки:", error);
    return [];
  }
}

export default function Home() {
  const { playlists, tracks } = useLibrary();
  const { playQueue } = usePlayer();
  const [hello, setHello] = useState("Привет");
  const [chart, setChart] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setHello(greeting());
    loadChart().then((d) => {
      setChart(d);
      setStatus(d.length ? "ok" : "error");
    });
  }, []);

  const pool = useMemo(() => {
    const seen = new Set();
    return [...tracks.filter((t) => t.favorite), ...chart].filter(
      (t) => !seen.has(t.id) && seen.add(t.id)
    );
  }, [tracks, chart]);

  const recent = useMemo(
    () => [...tracks].sort((a, b) => b.addedAt - a.addedAt).slice(0, 12),
    [tracks]
  );

  const favCount = tracks.filter((t) => t.favorite).length;

  function startWave() {
    if (pool.length) playQueue(shuffle(pool), 0);
  }

  return (
    <>
      <h1>{hello}</h1>

      <section className="wave">
        <div>
          <div className="wave-tag">Моя волна</div>
          <div className="wave-title">Музыка под настроение</div>
          <p>Бесконечная подборка из твоих любимых и популярных треков.</p>
          <button className="wave-btn" disabled={!pool.length} onClick={startWave}>
            <IconPlay width={22} height={22} /> Слушать
          </button>
        </div>
        <div className="wave-art" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <div className="quick">
        <Link href="/favorites" className="qtile">
          <div className="qcover fav">
            <IconHeart width={26} height={26} />
          </div>
          <span>Любимые · {favCount}</span>
        </Link>
        {playlists.slice(0, 5).map((p) => (
          <Link key={p.id} href={`/playlist/${p.id}`} className="qtile">
            <div className="qcover" style={{ background: gradientFor(p.id) }} />
            <span>{p.name}</span>
          </Link>
        ))}
      </div>

      {recent.length > 0 && (
        <>
          <div className="shelf-head">
            <h2>Недавно добавленные</h2>
            <Link href="/library" className="hint">
              Показать все
            </Link>
          </div>
          <div className="shelf">
            {recent.map((t, i) => (
              <TrackCard key={t.id} track={t} list={recent} index={i} />
            ))}
          </div>
        </>
      )}

      <div className="shelf-head">
        <h2>Популярное сейчас</h2>
        <Link href="/search" className="hint">
          Найти ещё
        </Link>
      </div>
      {status === "loading" && (
        <div className="shelf">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="tcard skel">
              <div className="tcard-cover" />
              <div className="tcard-title" />
              <div className="tcard-sub" />
            </div>
          ))}
        </div>
      )}
      {status === "error" && (
        <p className="empty">
          Не удалось загрузить подборку. Проверь интернет/VPN, а музыку можно
          искать через «Поиск».
        </p>
      )}
      {status === "ok" && (
        <div className="shelf">
          {chart.map((t, i) => (
            <TrackCard key={t.id} track={t} list={chart} index={i} />
          ))}
        </div>
      )}
    </>
  );
}