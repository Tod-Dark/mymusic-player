"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import TrackTable from "./TrackTable";

const SOURCES = [
  { key: "audius", label: "Audius · полные треки" },
  { key: "deezer", label: "Deezer · превью 30 сек" },
  { key: "youtube", label: "YouTube" },
];


const GENRES = [
  { name: "Поп", q: "pop", color: "#e13300" },
  { name: "Рок", q: "rock", color: "#7358ff" },
  { name: "Хип-хоп", q: "hip hop", color: "#8d67ab" },
  { name: "Электроника", q: "electronic", color: "#1e3264" },
  { name: "Lo-fi", q: "lofi", color: "#477d95" },
  { name: "Джаз", q: "jazz", color: "#b06239" },
  { name: "Классика", q: "classical", color: "#608108" },
  { name: "Метал", q: "metal", color: "#bc5900" },
  { name: "Чилл", q: "chill", color: "#1e8a6e" },
  { name: "Хаус", q: "house", color: "#af2896" },
  { name: "Инди", q: "indie", color: "#148a08" },
  { name: "Фонк", q: "phonk", color: "#503750" },
];

export default function SearchClient() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") || "";
  const source = params.get("source") || "audius";

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!q.trim()) {
      setTracks([]);
      setSearched(false);
      setError("");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/search?q=${encodeURIComponent(q)}&source=${source}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setTracks(d);
        setSearched(true);
      })
      .catch(() => {
        if (cancelled) return;
        setTracks([]);
        setError("Не удалось получить результаты. Проверь интернет/VPN или попробуй другой источник.");
        setSearched(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, source]);

  function pickSource(s) {
    router.replace(`/search?q=${encodeURIComponent(q)}&source=${s}`);
  }

  return (
    <>
      <h1>{q ? `Результаты: ${q}` : "Поиск"}</h1>

      <div className="chips">
        {SOURCES.map((s) => (
          <button
            key={s.key}
            className={`chip ${source === s.key ? "on" : ""}`}
            onClick={() => pickSource(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {!q.trim() && (
        <>
          <h2 style={{ marginTop: 16 }}>Жанры</h2>
          <div className="genres">
            {GENRES.map((g) => (
              <Link
                key={g.q}
                className="genre"
                style={{ background: g.color }}
                href={`/search?q=${encodeURIComponent(g.q)}&source=${source}`}
              >
                {g.name}
              </Link>
            ))}
          </div>
        </>
      )}

      {loading && <p className="empty">Ищем…</p>}
      {error && <p className="empty">{error}</p>}
      {!loading && searched && !error && tracks.length === 0 && (
        <p className="empty">Ничего не найдено. Попробуй другой источник.</p>
      )}
      {!loading && tracks.length > 0 && <TrackTable tracks={tracks} />}
    </>
  );
}