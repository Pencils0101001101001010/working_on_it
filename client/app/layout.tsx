import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar/Navbar";
import { AuthProvider } from "./context/authContext";
import { Toaster } from "react-hot-toast";
import { VideoProvider } from "./context/VideoContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Everything",
  description: "App with odds and ends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col global-bg">
        <AuthProvider>
          <VideoProvider>
            {" "}
            <Navbar />
            <Toaster />
            {children}
          </VideoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
