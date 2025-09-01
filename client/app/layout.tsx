import { Lusitana, Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import QueryProvider from "./context/QueryProvider";
import { AuthProvider } from "./context/AuthProvider";
import { SidebarProvider } from "./context/SidebarContext";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "./context/ReduxProvider";
import GmailListener from "@/components/listeners/GmailListener";
import NotificationListener from "@/components/listeners/NotificationListener";
import { NotificationProvider } from "./context/NotificationProvider";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Inboxlyone",
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
    <html lang="en" className={`${InerSans.className} overflow-x-clip`}>
      <body className={`${styles.container} overflow-x-clip`}>
        <ReduxProvider>
          <QueryProvider>
            <NotificationProvider>
              <NotificationListener />
              <AuthProvider>
                <GmailListener>
                  <SidebarProvider>
                    <Toaster position="top-right" />
                    {children}
                  </SidebarProvider>
                </GmailListener>
              </AuthProvider>
            </NotificationProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
