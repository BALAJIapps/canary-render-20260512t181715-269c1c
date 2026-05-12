import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";

import { Toaster } from "@/components/providers/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Syne: geometric, confident display font — distinctive for headlines
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CourseForge — AI Course Marketplace",
  description: "Teachers upload lessons. AI generates instant summaries. Students discover and subscribe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${syne.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
