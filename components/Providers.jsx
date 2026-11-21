"use client";
import { LibraryProvider } from "./LibraryContext";
import { PlayerProvider } from "./PlayerContext";

export default function Providers({ children }) {
  return (
    <LibraryProvider>
      <PlayerProvider>{children}</PlayerProvider>
    </LibraryProvider>
  );
}
