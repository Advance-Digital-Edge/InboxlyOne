"use client";

import { usePathname } from "next/navigation";
import { useConnectSocket } from "@/hooks/useConnectSocket";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setHasNew } from "@/lib/features/platformStatusSlice";
import { useQueryClient } from "@tanstack/react-query";

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // --- Messenger ---
  useConnectSocket("facebook_message", (event) => {
    const isInMessengerPage = pathname.startsWith("/dashboard/messenger");

    if (!isInMessengerPage) {
      dispatch(setHasNew({ platformId: "messenger", hasNew: true }));
    }
  });

  // --- Slack ---
  useConnectSocket("slack_event", (event) => {
    const isInSlackPage = pathname.startsWith("/dashboard/slack");

    toast("💬 New Slack message received");

    if (!isInSlackPage) {
    }
  });

  // --- Example: WhatsApp (future) ---
  // useConnectSocket("whatsapp_message", (event) => {
  //   const isInWhatsAppPage = pathname.startsWith("/whatsapp");
  //   toast("📲 New WhatsApp message received");
  //   if (!isInWhatsAppPage) {
  //     queryClient.invalidateQueries({ queryKey: ["whatsappMessages"] });
  //   }
  // });

  return <>{children}</>;
};
