import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { Navbar, Footer, MobileNavbar } from './components';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Story Snatcher - AI-Powered Video Summaries, Voiceovers, and Transcriptions",
  description: "Story Snatcher uses advanced AI to transcribe, summarize, and generate voiceovers for videos in seconds. Save time and create engaging content effortlessly.",
  keywords: "AI video summary, video transcription, voiceover generator, video content creation, downloadable transcripts",
  applicationName: "Story Snatcher",
  authors: [{ name: "Farzin Shifat", url: "https://storysnatcher.com" }],
  creator: "Farzin Shifat",
  publisher: "Story Snatcher",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Farzin Shifat" />
        <meta property="og:title" content="Story Snatcher - AI-Powered Video Summaries, Voiceovers, and Transcriptions" />
        <meta property="og:description" content="Story Snatcher uses advanced AI to transcribe, summarize, and generate voiceovers for videos in seconds. Save time and create engaging content effortlessly." />
        <meta property="og:url" content="https://storysnatcher.com" />
        <meta property="og:image" content="https://storysnatcher.com/images/og-image.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Story Snatcher" />
        <meta name="twitter:description" content="Transcribe, summarize, and create video voiceovers using advanced AI." />
        <meta name="twitter:image" content="https://storysnatcher.com/images/og-image.png" />
      </head>
      <body
        className={`${inter.variable} ${spaceMono.variable} antialiased h-full`}
      >
        <Navbar />
        <MobileNavbar />
        <main className="flex flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
