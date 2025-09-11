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

const defaultUrl = "https://inboxly.one";
export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Inboxlyone",
  description:
    "Inboxlyone puts all your DMs, emails, and client chats in one inbox — faster replies, less chaos, and more time for what matters.",

  openGraph: {
    title: "Inboxlyone",
    description:
      "Whether you freelance, create, or run a shop, Inboxlyone keeps every conversation in one place. Never miss a client, fan, or customer again.",
    url: defaultUrl,
    siteName: "Inboxlyone",
    images: [
      {
        url: `${defaultUrl}/og-image.png`, // ✅ create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: "Inboxlyone unified inbox preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Inboxlyone",
    description:
      "Inboxlyone puts all your DMs, emails, and client chats in one inbox — faster replies, less chaos, and more time for what matters.",
    images: [`${defaultUrl}/og-image.png`],
  },
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
