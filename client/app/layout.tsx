import { Lusitana, Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import QueryProvider from "./context/QueryProvider";
import { AuthProvider } from "./context/AuthProvider";
import { SidebarProvider } from "./context/SidebarContext";
import { Toaster } from "react-hot-toast";

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
          <QueryProvider>
            <SidebarProvider>
              <Toaster position="top-right" />
              {children}
            </SidebarProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
