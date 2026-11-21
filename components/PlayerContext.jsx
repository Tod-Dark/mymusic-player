"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const PlayerContext = createContext(null);

function loadYouTubeIframeAPI() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    if (window.YT && window.YT.Player) return resolve(window.YT);

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };

    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  });
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const ytContainerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytReadyRef = useRef(false);
  const modeRef = useRef("audio"); // "audio" | "youtube"
  const reqRef = useRef(0);
  const nextRef = useRef(null);
  const stateRef = useRef({ queue: [], index: -1, repeat: "off", shuffle: false });

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off | all | one

  useEffect(() => {
    stateRef.current = { queue, index, repeat, shuffle };
  });

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    if (ytPlayerRef.current && ytReadyRef.current && ytPlayerRef.current.setVolume) {
      ytPlayerRef.current.setVolume(Math.round(volume * 100));
    }
  }, [volume]);

  const ensureYouTubePlayer = useCallback(async (videoId) => {
    const YT = await loadYouTubeIframeAPI();
    if (!YT || !ytContainerRef.current) return null;

    if (ytPlayerRef.current && ytReadyRef.current) {
      ytPlayerRef.current.loadVideoById(videoId);
      ytPlayerRef.current.setVolume(Math.round(volume * 100));
      return ytPlayerRef.current;
    }

    return new Promise((resolve) => {
      ytPlayerRef.current = new YT.Player(ytContainerRef.current, {
        height: "0",
        width: "0",
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
        },
        events: {
          onReady: (e) => {
            ytReadyRef.current = true;
            e.target.setVolume(Math.round(volume * 100));
            e.target.playVideo();
            resolve(e.target);
          },
          onStateChange: (e) => {
            if (modeRef.current !== "youtube") return;
            if (e.data === YT.PlayerState.PLAYING) {
              setPlaying(true);
              const d = e.target.getDuration?.() || 0;
              if (d > 0) setDuration(d);
            } else if (e.data === YT.PlayerState.PAUSED) {
              setPlaying(false);
            } else if (e.data === YT.PlayerState.ENDED) {
              setPlaying(false);
              nextRef.current?.(true);
            }
          },
          onError: () => {
            if (modeRef.current !== "youtube") return;
            setError("Не удалось воспроизвести видео с YouTube");
            setPlaying(false);
          },
        },
      });
    });
  }, [volume]);

  // Обновление прогресса для YouTube
  useEffect(() => {
    const id = setInterval(() => {
      if (modeRef.current === "youtube" && ytPlayerRef.current && ytReadyRef.current) {
        const cur = ytPlayerRef.current.getCurrentTime?.() || 0;
        const dur = ytPlayerRef.current.getDuration?.() || 0;
        setProgress(cur);
        if (dur > 0) setDuration(dur);
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  const loadAndPlay = useCallback(
    async (track) => {
      const audio = audioRef.current;
      if (!audio || !track) return;
      const req = ++reqRef.current;
      setError("");
      setLoading(true);
      setProgress(0);
      setDuration(track.duration || 0);

      try {
        if (track.source === "youtube") {
          modeRef.current = "youtube";
          audio.pause();

          let videoId = track.videoId;
          if (!videoId) {
            const params = new URLSearchParams({
              title: track.title || "",
              artist: track.artist || "",
            });
            const res = await fetch(`/api/youtube?${params.toString()}`);
            if (!res.ok) throw new Error("Не удалось найти видео на YouTube");
            const data = await res.json();
            videoId = data.videoId;
          }
          if (req !== reqRef.current) return;
          if (!videoId) throw new Error("Видео на YouTube не найдено");

          await ensureYouTubePlayer(videoId);
          return;
        }

        modeRef.current = "audio";
        if (ytPlayerRef.current && ytReadyRef.current && ytPlayerRef.current.pauseVideo) {
          ytPlayerRef.current.pauseVideo();
        }

        let src = track.src;
        if (track.source === "audius") {
          src = `https://api.audius.co/v1/tracks/${track.externalId}/stream?app_name=MyMusic`;
        }
        if (track.source === "deezer") {
          const res = await fetch(`/api/track/${track.externalId}`);
          if (!res.ok) throw new Error("Трек не найден");
          src = (await res.json()).preview;
        }
        if (req !== reqRef.current) return;
        if (!src) throw new Error("У этого трека нет превью");
        audio.src = src;
        await audio.play();
      } catch (e) {
        if (e.name === "AbortError" || req !== reqRef.current) return;
        setError(e.message || "Не удалось воспроизвести");
        setPlaying(false);
      } finally {
        if (req === reqRef.current) setLoading(false);
      }
    },
    [ensureYouTubePlayer]
  );

  const playAt = useCallback(
    (i) => {
      const { queue } = stateRef.current;
      if (i < 0 || i >= queue.length) return;
      setIndex(i);
      stateRef.current = { ...stateRef.current, index: i };
      loadAndPlay(queue[i]);
    },
    [loadAndPlay]
  );

  const playQueue = useCallback(
    (list, start = 0) => {
      setQueue(list);
      setIndex(start);
      stateRef.current = { ...stateRef.current, queue: list, index: start };
      loadAndPlay(list[start]);
    },
    [loadAndPlay]
  );

  const next = useCallback(
    (auto = false) => {
      const { queue, index, repeat, shuffle } = stateRef.current;
      if (!queue.length) return;
      if (auto && repeat === "one") return playAt(index);
      if (shuffle && queue.length > 1) {
        let r = index;
        while (r === index) r = Math.floor(Math.random() * queue.length);
        return playAt(r);
      }
      if (index + 1 < queue.length) playAt(index + 1);
      else if (repeat === "all" || !auto) playAt(0);
      else setPlaying(false);
    },
    [playAt]
  );

  const prev = useCallback(() => {
    const { index } = stateRef.current;
    if (modeRef.current === "youtube" && ytPlayerRef.current && ytReadyRef.current) {
      const cur = ytPlayerRef.current.getCurrentTime?.() || 0;
      if (cur > 3) {
        ytPlayerRef.current.seekTo(0, true);
        return;
      }
    } else if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    playAt(index > 0 ? index - 1 : 0);
  }, [playAt]);

  const togglePlay = () => {
    if (!stateRef.current.queue.length) return;
    if (modeRef.current === "youtube" && ytPlayerRef.current && ytReadyRef.current) {
      if (playing) ytPlayerRef.current.pauseVideo();
      else ytPlayerRef.current.playVideo();
      return;
    }
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  const seek = (t) => {
    if (modeRef.current === "youtube" && ytPlayerRef.current && ytReadyRef.current) {
      ytPlayerRef.current.seekTo(t, true);
      setProgress(t);
      return;
    }
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  };

  const setVolume = (v) => setVolumeState(v);
  const toggleShuffle = () => setShuffle((s) => !s);
  const cycleRepeat = () =>
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  const current = index >= 0 ? queue[index] : null;

  return (
    <PlayerContext.Provider
      value={{
        current,
        playing,
        loading,
        error,
        progress,
        duration,
        volume,
        shuffle,
        repeat,
        playQueue,
        togglePlay,
        next,
        prev,
        seek,
        setVolume,
        toggleShuffle,
        cycleRepeat,
      }}
    >
      {children}
      <div ref={ytContainerRef} style={{ display: "none" }} />
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => {
          if (modeRef.current === "audio") setProgress(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          if (modeRef.current === "audio") setDuration(e.currentTarget.duration);
        }}
        onPlay={() => {
          if (modeRef.current === "audio") setPlaying(true);
        }}
        onPause={() => {
          if (modeRef.current === "audio") setPlaying(false);
        }}
        onEnded={() => {
          if (modeRef.current === "audio") next(true);
        }}
      />
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);