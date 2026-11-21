"use client";
import { usePlayer } from "./PlayerContext";
import { useLibrary } from "./LibraryContext";
import { fmt, gradientFor } from "../lib/format";
import {
  IconPlay,
  IconPause,
  IconHeart,
  IconHeartOutline,
  IconClose,
} from "./Icons";

export default function TrackTable({ tracks, onRemove }) {
  const { playQueue, current, playing, togglePlay } = usePlayer();
  const { toggleFavorite, isFavorite, playlists, addToPlaylist, createPlaylist } =
    useLibrary();

  if (!tracks.length) return null;

  function handleAdd(track, value) {
    if (!value) return;
    if (value === "__new") {
      const name = window.prompt("Название нового плейлиста");
      if (!name || !name.trim()) return;
      const id = createPlaylist(name.trim());
      addToPlaylist(id, track);
    } else {
      addToPlaylist(value, track);
    }
  }

  return (
    <table className="tracks">
      <thead>
        <tr>
          <th style={{ width: 52, textAlign: "center" }}>#</th>
          <th>Название</th>
          <th className="col-album">Альбом</th>
          <th></th>
          <th>Время</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((t, i) => {
          const active = current?.id === t.id;
          const fav = isFavorite(t.id);
          return (
            <tr
              key={t.id}
              className={active ? "active" : ""}
              onDoubleClick={() => playQueue(tracks, i)}
            >
              <td className="num">
                {active && playing ? (
                  <span className="eq">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <span className="idx">{i + 1}</span>
                )}
                <button
                  className="rowplay"
                  onClick={() => (active ? togglePlay() : playQueue(tracks, i))}
                >
                  {active && playing ? (
                    <IconPause width={18} height={18} />
                  ) : (
                    <IconPlay width={18} height={18} />
                  )}
                </button>
              </td>
              <td>
                <div className="name">
                  {t.coverUrl ? (
                    <img className="mini" src={t.coverUrl} alt="" />
                  ) : (
                    <div className="mini" style={{ background: gradientFor(t.id) }} />
                  )}
                  <div className="name-text">
                    <div className="name-title">{t.title}</div>
                    <div className="name-artist">{t.artist}</div>
                  </div>
                </div>
              </td>
              <td className="col-album">{t.album}</td>
              <td>
                <button
                  className={`heart-btn ${fav ? "on" : ""}`}
                  onClick={() => toggleFavorite(t)}
                  title="В любимые"
                >
                  {fav ? <IconHeart /> : <IconHeartOutline />}
                </button>
              </td>
              <td>{fmt(t.duration)}</td>
              <td className="actions">
                <select
                  className="mini-select"
                  value=""
                  onChange={(e) => handleAdd(t, e.target.value)}
                >
                  <option value="">＋ В плейлист</option>
                  {playlists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  <option value="__new">➕ Новый плейлист…</option>
                </select>
                {onRemove && (
                  <button className="rm" title="Убрать" onClick={() => onRemove(t)}>
                    <IconClose />
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}