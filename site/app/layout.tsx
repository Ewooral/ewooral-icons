import type { Metadata } from "next";
import "./globals.css";
import "../_icons-css.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: {
    default: "@ewooral/icons — distinctive medallion-style icon set",
    template: "%s · @ewooral/icons",
  },
  description:
    "Ewooral & BFAM Holdings — 56 icons in a unique medallion style with cartoonish hover splash. Configurable triggers, full per-icon controls. Works in React, Next.js, Vue, Svelte, vanilla — Flutter soon.",
  openGraph: {
    title: "@ewooral/icons",
    description: "Distinctive medallion-style icon set with cartoonish hover splash.",
    url: "https://icons.ewooral.com",
    siteName: "@ewooral/icons",
    type: "website",
  },
  metadataBase: new URL("https://icons.ewooral.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
