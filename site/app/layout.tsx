import type { Metadata } from "next";
import "./globals.css";
import "../_icons-css.css";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ThemeProvider } from "../lib/theme";

/* Inline before-hydration script — paints the user's chosen theme on the
   very first frame so the page doesn't flash default→stored on every load. */
const THEME_BOOTSTRAP = `
(function(){try{var t=localStorage.getItem("ewooral_icons_theme");
if(t==="light"||t==="dark"||t==="default"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();
`;

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
