import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { DataProvider } from "../context/DataContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { DemoRoleSwitcher } from "../components/DemoRoleSwitcher";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gajjar Hub — Everything hostel, in one place",
  description: "Raise a complaint, read the latest notices and check today's mess menu without chasing anyone.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#222223",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-bg-end text-text selection:bg-primary/30 selection:text-white flex flex-col">
        <AuthProvider>
          <DataProvider>
            {/* Header */}
            <Header />

            {/* Main Content Area */}
            <div className="flex-1 w-full">
              {children}
            </div>

            {/* Footer */}
            <Footer />

            {/* Role switcher helper */}
            <DemoRoleSwitcher />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
