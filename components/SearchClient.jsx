"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import TrackTable from "./TrackTable";

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

const HISTORY_KEY = "mymusic-search-history";
const MAX_HISTORY = 10;

export default function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") || "";

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const saveHistory = useCallback((list) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch {}
  }, []);

  const addHistory = useCallback(
    (query) => {
      const v = query.trim();
      if (!v) return;
      const next = [v, ...history.filter((h) => h !== v)].slice(0, MAX_HISTORY);
      setHistory(next);
      saveHistory(next);
    },
    [history, saveHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  }, []);

  const runSearch = useCallback(
    (query) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (!query.trim()) {
          setTracks([]);
          setSearched(false);
          setError("");
          return;
        }

        setLoading(true);
        setError("");

        try {
          const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (!r.ok) throw new Error("Search failed");
          const data = await r.json();
          setTracks(data);
          setSearched(true);
          addHistory(query);
        } catch {
          setTracks([]);
          setError(
            "Не удалось получить результаты. Проверь интернет или VPN."
          );
          setSearched(true);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [addHistory]
  );

  useEffect(() => {
    runSearch(q);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [q, runSearch]);

  function submit(e) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    router.push(
      `/search?q=${encodeURIComponent(v)}&source=${
        params.get("source") || "audius"
      }`
    );
  }

  const showHistory = !q.trim() && history.length > 0;

  return (
    <>
      <h1>{q ? `Результаты: ${q}` : "Поиск"}</h1>

      {!q.trim() && (
        <>
          <h2 style={{ marginTop: 16 }}>Жанры</h2>

          <div className="genres">
            {GENRES.map((g) => (
              <Link
                key={g.q}
                className="genre"
                style={{ background: g.color }}
                href={`/search?q=${encodeURIComponent(g.q)}`}
              >
                {g.name}
              </Link>
            ))}
          </div>
        </>
      )}

      {showHistory && (
        <>
          <h2 className="search-history-title">Недавно искали</h2>
          <div className="search-history-list">
            {history.map((h, i) => (
              <button
                key={i}
                className="history-item"
                onClick={() => {
                  router.push(
                    `/search?q=${encodeURIComponent(h)}&source=${
                      params.get("source") || "audius"
                    }`
                  );
                }}
              >
                <span>{i + 1}</span> {h}
              </button>
            ))}
            <button className="history-clear" onClick={clearHistory}>
              Очистить историю
            </button>
          </div>
        </>
      )}

      {loading && <p className="empty">Ищем на YouTube…</p>}

      {error && <p className="empty">{error}</p>}

      {!loading && searched && !error && tracks.length === 0 && (
        <p className="empty">
          Ничего не найдено. Попробуй другое название или исполнителя.
        </p>
      )}

      {!loading && tracks.length > 0 && (
        <TrackTable tracks={tracks} />
      )}
    </>
  );
}
