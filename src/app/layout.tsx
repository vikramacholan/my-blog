import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import BlogSidebar from "@/components/BlogSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  title: "My Blog",
  description: "A blog built with Next.js and Contentful",
};

export const revalidate = 300;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-gray-50">
        <ThemeProvider attribute="class" defaultTheme="mocha" themes={['light', 'mocha']}>
          <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">
            {/* Main content area */}
            <main className="flex-1 flex flex-col lg:overflow-y-auto">{children}</main>
            {/* Sidebar */}
            <BlogSidebar />
          </div>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
