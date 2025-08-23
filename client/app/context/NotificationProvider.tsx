"use client";

import { usePathname } from "next/navigation";
import { useConnectSocket } from "@/hooks/useConnectSocket";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setHasNew } from "@/lib/features/platformStatusSlice";
import { useQueryClient } from "@tanstack/react-query";
import { incrementFacebookUnread } from "../actions";

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // --- Messenger ---
  useConnectSocket("facebook_message", async (event) => {
    const isInMessengerPage = pathname?.startsWith("/dashboard/messenger") || false;

    if (!isInMessengerPage) {
      dispatch(setHasNew({ platformId: "messenger", hasNew: true }));
      await incrementFacebookUnread(event.senderId);
    }
  });

  // --- Slack ---
  useConnectSocket("slack_event", (event) => {
    const isInSlackPage = pathname?.startsWith("/dashboard/slack") || false;

    toast("💬 New Slack message received");

    if (!isInSlackPage) {
    }
  });

  return <>{children}</>;
};
