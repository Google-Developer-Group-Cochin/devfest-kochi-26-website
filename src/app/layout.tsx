import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import localFont from "next/font/local";
import { Noto_Sans_Malayalam } from "next/font/google";
import EggReveal from "@/components/EggReveal";
import Providers from "@/components/Providers";
import { seoDescription, seoTitle, siteUrl } from "@/content/site";
import { ogAlt, ogSize } from "./og-card";
import "./globals.css";

const googleSans = localFont({
  src: [
    { path: "./fonts/GoogleSans-normal-latin.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/GoogleSans-italic-latin.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-google-sans",
});

const googleSansCode = localFont({
  src: "./fonts/GoogleSansCode-normal-latin.woff2",
  weight: "300 800",
  variable: "--font-google-sans-code",
});

const malayalam = Noto_Sans_Malayalam({ subsets: ["malayalam"], weight: "500", variable: "--font-noto-malayalam", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: seoTitle,
  description: seoDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: "/",
    siteName: "DevFest Kochi",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og.png", ...ogSize, alt: ogAlt, type: "image/png" }],
  },
  twitter: { card: "summary_large_image", title: seoTitle, description: seoDescription, images: [{ url: "/og.png", alt: ogAlt }] },
};

export const viewport: Viewport = { themeColor: "#f0f0f0" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${googleSans.variable} ${googleSansCode.variable} ${malayalam.variable} antialiased`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <Providers>
          {children}
          <EggReveal />
        </Providers>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
