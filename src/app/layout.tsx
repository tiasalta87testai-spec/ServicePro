import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./layout-client";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Service Pro",
  description: "Web app SaaS multi-tenant per aziende di service audio/luci/video.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = {
  themeColor: "#0f172a", // slate-900
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
        <Toaster />
      </body>
    </html>
  );
}
