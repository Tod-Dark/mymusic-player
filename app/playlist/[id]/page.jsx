"use client";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLibrary } from "../../../components/LibraryContext";
import { usePlayer } from "../../../components/PlayerContext";
import TrackTable from "../../../components/TrackTable";
import { gradientFor } from "../../../lib/format";

export default function PlaylistPage() {
  const { id } = useParams();
  const router = useRouter();
  const { ready, playlists, tracks, renamePlaylist, deletePlaylist, removeFromPlaylist } =
    useLibrary();
  const { playQueue } = usePlayer();
  const [sort, setSort] = useState("manual");

  const playlist = playlists.find((p) => p.id === id);

  const list = useMemo(() => {
    if (!playlist) return [];
    const l = playlist.trackIds
      .map((tid) => tracks.find((t) => t.id === tid))
      .filter(Boolean);
    if (sort === "manual") return l;
    return [...l].sort((a, b) =>
      String(a[sort] || "").localeCompare(String(b[sort] || ""), "ru", {
        sensitivity: "base",
      })
    );
  }, [playlist, tracks, sort]);

  if (!ready) return null;
  if (!playlist) return <p className="empty">Плейлист не найден.</p>;

  function rename() {
    const name = window.prompt("Новое название", playlist.name);
    if (name && name.trim()) renamePlaylist(playlist.id, name.trim());
  }

  function remove() {
    if (window.confirm(`Удалить плейлист «${playlist.name}»?`)) {
      deletePlaylist(playlist.id);
      router.push("/");
    }
  }

  return (
    <>
      <div className="hero">
        <div className="big-cover" style={{ background: gradientFor(playlist.id) }} />
        <div>
          <div className="hint">Плейлист</div>
          <h1 className="hero-title">{playlist.name}</h1>
          <div className="hint">{list.length} треков</div>
        </div>
      </div>

      <div className="toolbar">
        {list.length > 0 && (
          <button className="btn primary" onClick={() => playQueue(list, 0)}>
            ▶ Слушать
          </button>
        )}
        <select className="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="manual">Свой порядок</option>
          <option value="title">По названию</option>
          <option value="artist">По исполнителю</option>
          <option value="album">По альбому</option>
        </select>
        <button className="btn" onClick={rename}>✎ Переименовать</button>
        <button className="btn danger" onClick={remove}>🗑 Удалить</button>
      </div>

      {list.length === 0 ? (
        <p className="empty">
          Плейлист пуст. Найди треки в «Поиске» и выбери этот плейлист в строке
          трека («＋ В плейлист»).
        </p>
      ) : (
        <TrackTable
          tracks={list}
          onRemove={(t) => removeFromPlaylist(playlist.id, t.id)}
        />
      )}
    </>
  );
}