import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ghet.review | Food & Vibes",
  description: "Nền tảng đánh giá ẩm thực tối giản",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${inter.className} antialiased bg-black text-white selection:bg-white selection:text-black`}
        suppressHydrationWarning
      >
        <CustomCursor />
        <header className="w-full flex justify-between items-center py-6 px-6 max-w-6xl mx-auto">
          <a href="/" className="text-2xl font-bold tracking-tight uppercase hover:text-pink-400 transition-colors">
            ghet.review
          </a>
          
          {/* TẠM ẨN: Nút dắt link Hidden Gems khi deploy lên Prod để test
          <a 
            href="/hidden-gems" 
            className="text-sm font-medium text-pink-500 bg-pink-500/10 px-4 py-2 rounded-full hover:bg-pink-500 hover:text-white transition-all flex items-center gap-2"
          >
            💎 Hidden Gems
          </a> 
          */}
        </header>

        {children}
        <Analytics />
      </body>
    </html>
  );
}
