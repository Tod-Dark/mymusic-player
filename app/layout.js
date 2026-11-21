import { Suspense } from "react";
import "./globals.css";
import Providers from "../components/Providers";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import PlayerBar from "../components/PlayerBar";

export const metadata = { title: "MyMusic" };

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="app">
            <Sidebar />
            <main className="main">
              <Suspense fallback={<div className="topbar" />}>
                <TopBar />
              </Suspense>
              <div className="content">{children}</div>
            </main>
            <PlayerBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}