"use client";
import { createContext, useContext, useEffect, useState } from "react";

const LibraryContext = createContext(null);
const KEY = "mymusic-data-v1";

function clean(t) {
  return {
    id: t.id,
    externalId: t.externalId,
    source: t.source,
    title: t.title,
    artist: t.artist,
    album: t.album || "",
    coverUrl: t.coverUrl || "",
    duration: t.duration || 0,
  };
}

function ensureTrack(prev, track) {
  return prev.some((t) => t.id === track.id)
    ? prev
    : [...prev, { ...clean(track), favorite: false, addedAt: Date.now() }];
}

export function LibraryProvider({ children }) {
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setTracks(data.tracks || []);
        setPlaylists(data.playlists || []);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ tracks, playlists }));
    } catch {}
  }, [tracks, playlists, ready]);

  const addTrack = (track) => setTracks((prev) => ensureTrack(prev, track));

  const removeTrack = (id) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setPlaylists((prev) =>
      prev.map((p) => ({ ...p, trackIds: p.trackIds.filter((x) => x !== id) }))
    );
  };

  const toggleFavorite = (track) =>
    setTracks((prev) =>
      ensureTrack(prev, track).map((t) =>
        t.id === track.id ? { ...t, favorite: !t.favorite } : t
      )
    );

  const isFavorite = (id) => tracks.some((t) => t.id === id && t.favorite);

  const createPlaylist = (name) => {
    const id = Date.now().toString(36);
    setPlaylists((prev) => [...prev, { id, name, trackIds: [] }]);
    return id;
  };

  const renamePlaylist = (id, name) =>
    setPlaylists((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));

  const deletePlaylist = (id) =>
    setPlaylists((prev) => prev.filter((p) => p.id !== id));

  const addToPlaylist = (playlistId, track) => {
    setTracks((prev) => ensureTrack(prev, track));
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.trackIds.includes(track.id)
          ? { ...p, trackIds: [...p.trackIds, track.id] }
          : p
      )
    );
  };

  const removeFromPlaylist = (playlistId, trackId) =>
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, trackIds: p.trackIds.filter((x) => x !== trackId) }
          : p
      )
    );

  return (
    <LibraryContext.Provider
      value={{
        ready,
        tracks,
        playlists,
        addTrack,
        removeTrack,
        toggleFavorite,
        isFavorite,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);