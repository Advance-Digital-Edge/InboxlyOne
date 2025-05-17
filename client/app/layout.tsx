import { Lusitana, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Footer from "@/components/layout/Footer";
import styles from "./layout.module.css";
import Navbar from "@/components/layout/Navbar";
import QueryProvider from "./context/QueryProvider";
import { AuthProvider } from "./context/AuthProvider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const InerSans = Inter({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={InerSans.className}>
      <body className={styles.container}>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
