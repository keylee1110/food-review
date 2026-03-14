import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className={`${inter.className} antialiased bg-black text-white selection:bg-white selection:text-black`}>
        <CustomCursor />
        {/* Minimalist Header */}
        <header className="w-full flex justify-center py-8">
          <h1 className="text-2xl font-bold tracking-tight uppercase">ghet.review</h1>
        </header>

        <main className="max-w-md mx-auto min-h-screen px-4 pb-20">
          {children}
        </main>
      </body>
    </html>
  );
}
