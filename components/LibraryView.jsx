"use client";
import { useMemo, useState } from "react";
import { useLibrary } from "./LibraryContext";
import { usePlayer } from "./PlayerContext";
import TrackTable from "./TrackTable";

const SORTS = [
  { key: "addedAt", label: "По дате добавления" },
  { key: "title", label: "По названию" },
  { key: "artist", label: "По исполнителю" },
  { key: "album", label: "По альбому" },
  { key: "duration", label: "По длительности" },
];

export default function LibraryView({ onlyFavorites = false }) {
  const { tracks, removeTrack } = useLibrary();
  const { playQueue } = usePlayer();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("addedAt");
  const [dir, setDir] = useState("desc");

  const list = useMemo(() => {
    let l = onlyFavorites ? tracks.filter((t) => t.favorite) : tracks;
    const q = query.trim().toLowerCase();
    if (q) {
      l = l.filter((t) =>
        `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(q)
      );
    }
    const mul = dir === "asc" ? 1 : -1;
    return [...l].sort((a, b) => {
      const x = a[sort];
      const y = b[sort];
      if (typeof x === "number") return (x - y) * mul;
      return (
        String(x || "").localeCompare(String(y || ""), "ru", {
          sensitivity: "base",
        }) * mul
      );
    });
  }, [tracks, onlyFavorites, query, sort, dir]);

  function changeSort(key) {
    setSort(key);
    setDir(key === "addedAt" ? "desc" : "asc");
  }

  return (
    <>
      <h1>{onlyFavorites ? "♥ Любимые" : "📚 Моя библиотека"}</h1>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Поиск по библиотеке"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="sort"
          value={sort}
          onChange={(e) => changeSort(e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          className="btn"
          onClick={() => setDir((d) => (d === "asc" ? "desc" : "asc"))}
        >
          {dir === "asc" ? "↑ А-Я" : "↓ Я-А"}
        </button>
        {list.length > 0 && (
          <button className="btn primary" onClick={() => playQueue(list, 0)}>
            ▶ Слушать всё
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="empty">
          Здесь пока пусто. Найди треки во вкладке «Поиск» и нажми ♡ или добавь
          в плейлист.
        </p>
      ) : (
        <TrackTable
          tracks={list}
          onRemove={onlyFavorites ? undefined : (t) => removeTrack(t.id)}
        />
      )}
    </>
  );
}