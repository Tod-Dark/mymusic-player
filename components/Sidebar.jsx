"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLibrary } from "./LibraryContext";
import { gradientFor } from "../lib/format";
import {
  IconHome,
  IconSearch,
  IconLibrary,
  IconHeart,
  IconPlus,
  IconNote,
} from "./Icons";

const nav = [
  { href: "/", label: "Главная", Icon: IconHome },
  { href: "/search", label: "Поиск", Icon: IconSearch },
    { href: "/catalog", label: "Каталог", Icon: IconNote },
  { href: "/library", label: "Медиатека", Icon: IconLibrary },
  { href: "/favorites", label: "Любимые", Icon: IconHeart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { playlists, tracks, createPlaylist } = useLibrary();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const favCount = tracks.filter((t) => t.favorite).length;

  function newPlaylist() {
    const name = window.prompt("Название плейлиста");
    if (!name || !name.trim()) return;
    const id = createPlaylist(name.trim());
    router.push(`/playlist/${id}`);
  }

  return (
    <>
      <aside className="sidebar">
        <div className="panel">
          <div className="logo">
            <span className="logo-dot">
              <IconNote />
            </span>
            MyMusic
          </div>
          <nav className="nav">
            {nav.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
                <Icon />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="panel lib-panel">
          <div className="lib-head">
            <span>Плейлисты</span>
            <button className="icon-btn" onClick={newPlaylist} title="Новый плейлист">
              <IconPlus />
            </button>
          </div>

          <div className="pl-list">
            <Link
              href="/favorites"
              className={`pl-item ${pathname === "/favorites" ? "active" : ""}`}
            >
              <div className="pl-cover fav">
                <IconHeart />
              </div>
              <div className="pl-text">
                <div className="pl-name">Любимые</div>
                <div className="pl-sub">Автоплейлист · {favCount}</div>
              </div>
            </Link>

            {playlists.map((p) => (
              <Link
                key={p.id}
                href={`/playlist/${p.id}`}
                className={`pl-item ${pathname === `/playlist/${p.id}` ? "active" : ""}`}
              >
                <div className="pl-cover" style={{ background: gradientFor(p.id) }} />
                <div className="pl-text">
                  <div className="pl-name">{p.name}</div>
                  <div className="pl-sub">Плейлист · {p.trackIds.length}</div>
                </div>
              </Link>
            ))}

            {playlists.length === 0 && (
              <div className="lib-empty">
                <b>Создай первый плейлист</b>
                <p>Собирай свою музыку по настроению.</p>
                <button className="btn primary" onClick={newPlaylist}>
                  Создать
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <nav className="mnav">
        {nav.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={isActive(href) ? "active" : ""}>
            <Icon />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}