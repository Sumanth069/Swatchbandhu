import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/NavigationBar";
import DesktopHeader from "@/components/DesktopHeader";
import AuthWrapper from "@/components/AuthWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwachBandu | Clean Your City",
  description: "Crowdsourced garbage mapping and AI-verified cleanups.",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-300 md:overflow-hidden pt-safe-top md:pt-[100px]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthWrapper>
            <DesktopHeader />
            <NavigationBar />
            <main className="flex-1 w-full relative bg-white dark:bg-zinc-950 min-h-[100dvh] shadow-xl overflow-hidden transition-colors duration-300">
              {children}
            </main>
          </AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
