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
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#121212" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
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