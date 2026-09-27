import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "SharpKit - Free Image Compressor for JAMB, NYSC & NIN",
    template: "%s | SharpKit",
  },
  description:
    "Compress images online for free to 20KB, 50KB, 200KB or a custom size. Reduce photos for JAMB, NYSC, NIN and other Nigerian online portals.",
  keywords: [
    "image compressor",
    "compress image to 50KB",
    "compress image to 20KB",
    "compress image to 200KB",
    "JAMB photo compressor",
    "NYSC photo compressor",
    "NIN photo compressor",
    "Nigeria image compressor",
    "passport photo compressor",
  ],
  applicationName: "SharpKit",
  generator: "Next.js",
  verification: {
    google: "UJCj6lk6RVLg0Cfy1JHVvUrqYeyGKowSkLuA3bDAoVc",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
