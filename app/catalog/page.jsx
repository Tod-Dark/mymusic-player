"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLibrary } from "../../components/LibraryContext";
import TrackTable from "../../components/TrackTable";
import { PRESETS } from "../../lib/presets";

const DEFAULT = ["top", "pop", "hiphop", "rock", "phonk", "anime"];

export default function CatalogPage() {
  const router = useRouter();
  const { playlists, addTrack, createPlaylist, addToPlaylist } = useLibrary();

  const [selected, setSelected] = useState(DEFAULT);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState("");

  const [artistQ, setArtistQ] = useState("");
  const [artist, setArtist] = useState(null);
  const [artistLoading, setArtistLoading] = useState(false);
  const [artistErr, setArtistErr] = useState("");

  function toggle(key) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function build() {
    setRunning(true);
    setMsg("");
    let processed = 0;
    let createdPlaylists = 0;

    for (const key of selected) {
      const preset = PRESETS.find((p) => p.key === key);
      if (!preset) continue;
      setMsg(`Загружаю: ${preset.label}…`);
      try {
        const res = await fetch(`/api/catalog?preset=${key}`);
        if (!res.ok) continue;
        const list = await res.json();
        if (!Array.isArray(list) || list.length === 0) continue;

        const existing = playlists.find((p) => p.name === preset.label);
        let id;
        if (existing) {
          id = existing.id;
        } else {
          id = createPlaylist(preset.label);
          createdPlaylists++;
        }
        list.forEach((t) => addToPlaylist(id, t));
        processed += list.length;
      } catch {}
    }

    setMsg(
      processed
        ? `Готово: обработано треков ${processed}, новых плейлистов ${createdPlaylists}. Они уже в боковом меню и в «Медиатеке».`
        : "Ничего не загрузилось. Проверь интернет/VPN и терминал с npm run dev."
    );
    setRunning(false);
  }

  async function findArtist(e) {
    e.preventDefault();
    const q = artistQ.trim();
    if (!q) return;
    setArtistLoading(true);
    setArtistErr("");
    setArtist(null);
    try {
      const res = await fetch(`/api/catalog?artist=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const d = await res.json();
      if (!d.tracks || d.tracks.length === 0) setArtistErr("Исполнитель не найден.");
      else setArtist(d);
    } catch {
      setArtistErr("Не удалось загрузить. Проверь интернет/VPN.");
    }
    setArtistLoading(false);
  }

  function addAllArtist() {
    artist.tracks.forEach((t) => addTrack(t));
    setMsg(`В библиотеку добавлено треков: ${artist.tracks.length}.`);
  }

  function artistToPlaylist() {
    const id = createPlaylist(artist.name);
    artist.tracks.forEach((t) => addToPlaylist(id, t));
    router.push(`/playlist/${id}`);
  }

  return (
    <>
      <h1>📦 Каталог</h1>
      <p className="empty" style={{ marginTop: 0 }}>
        Наполни библиотеку известными песнями из Deezer. Играют 30-секундные
        превью, а сами данные сохраняются в твоём браузере.
      </p>

      <h2>Стартовая коллекция</h2>
      <div className="chips" style={{ marginTop: 14 }}>
        {PRESETS.map((p) => (
          <button
            key={p.key}
            className={`chip ${selected.includes(p.key) ? "on" : ""}`}
            onClick={() => toggle(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="toolbar">
        <button
          className="btn primary"
          disabled={running || selected.length === 0}
          onClick={build}
        >
          {running ? "Собираю…" : `Собрать коллекцию (${selected.length})`}
        </button>
        <span className="hint">
          Каждый выбранный жанр станет плейлистом (до 100 треков).
        </span>
      </div>
      {msg && <p className="empty">{msg}</p>}

      <h2 style={{ marginTop: 36 }}>Топ-треки исполнителя</h2>
      <form className="toolbar" style={{ marginTop: 14 }} onSubmit={findArtist}>
        <input
          className="search"
          placeholder="Например: Linkin Park, Kordhell, YOASOBI"
          value={artistQ}
          onChange={(e) => setArtistQ(e.target.value)}
        />
        <button className="btn primary" type="submit">
          Найти
        </button>
      </form>

      {artistLoading && <p className="empty">Ищем…</p>}
      {artistErr && <p className="empty">{artistErr}</p>}
      {artist && (
        <>
          <div className="toolbar">
            <b>{artist.name}</b>
            <span className="hint">{artist.tracks.length} треков</span>
            <button className="btn" onClick={addAllArtist}>
              ＋ Добавить все в библиотеку
            </button>
            <button className="btn primary" onClick={artistToPlaylist}>
              Создать плейлист
            </button>
          </div>
          <TrackTable tracks={artist.tracks} />
        </>
      )}
    </>
  );
}