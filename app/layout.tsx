import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COCOSiL",
  description: "MBTI × 12星座 × 60アニマル診断 × 六星占術 の統合性格分析 ＋ 共感AIチャット",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
