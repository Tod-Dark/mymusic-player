"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconClose,
} from "./Icons";

const THEMES = [
  { key: "spotify", title: "Тема Spotify", color: "#1db954" },
  { key: "yandex", title: "Тема Яндекс Музыки", color: "#ffdb4d" },
];

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlQ = params.get("q") || "";
  const source = params.get("source") || "audius";
  const [value, setValue] = useState("");
  const [theme, setTheme] = useState("spotify");

  function applyTheme(key) {
    setTheme(key);
    document.documentElement.dataset.theme = key;
    try {
      localStorage.setItem("mymusic-theme", key);
    } catch {}
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mymusic-theme");
      if (saved) applyTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (pathname === "/search") setValue(urlQ);
  }, [pathname, urlQ]);

  function submit(e) {
    e.preventDefault();
    const v = value.trim();
    if (v) router.push(`/search?q=${encodeURIComponent(v)}&source=${source}`);
  }

  return (
    <div className="topbar">
      <div className="nav-arrows">
        <button className="round" onClick={() => router.back()} title="Назад">
          <IconChevronLeft />
        </button>
        <button className="round" onClick={() => router.forward()} title="Вперёд">
          <IconChevronRight />
        </button>
      </div>

      <form className="topsearch" onSubmit={submit}>
        <IconSearch className="ico" width={22} height={22} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Что хочешь послушать?"
        />
        {value && (
          <button type="button" className="clear" onClick={() => setValue("")}>
            <IconClose width={18} height={18} />
          </button>
        )}
      </form>

      <div className="theme-switch">
        {THEMES.map((t) => (
          <button
            key={t.key}
            title={t.title}
            className={`theme-dot ${theme === t.key ? "on" : ""}`}
            style={{ background: t.color }}
            onClick={() => applyTheme(t.key)}
          />
        ))}
      </div>
    </div>
  );
}