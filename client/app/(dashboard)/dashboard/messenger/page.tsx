"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { messengerMessages } from "@/lib/constants";
import { useConnectSocket } from "@/hooks/useConnectSocket";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";
import { transformMessengerNewMessage } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthProvider";
export default function MessengerPage() {
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchMessages = async () => {
    const res = await fetch("/api/messenger/messages");

    if (!res.ok) {
      const data = await res.json();
      throw {
        message: data.error || "Unknown error",
        status: res.status,
      };
    }

    return res.json();
  };

  useConnectSocket("facebook_message", (event) => {
    const currentUserId = user?.id; //
    const senderName = selectedMessage?.sender;

    const newMessage = transformMessengerNewMessage(
      event,
      currentUserId,
      senderName
    );

    if (selectedMessage?.senderId === event.senderId) {
      setSelectedMessage((prev: { conversation: any }) => {
        if (!prev) return prev;
        return {
          ...prev,
          preview: event.message,
          timestamp: newMessage.ts,
          conversation: [...prev.conversation, newMessage],
        };
      });
    }

    queryClient.invalidateQueries({ queryKey: ["messengerMessages"] });
  });

  const selectMessageHandler = (message: any) => {
    setSelectedMessage(message);
    if (!rightPanelOpen) setRightPanelOpen(true);
  };

  // Close right panel and clear selected message
  const closeRightPanel = () => {
    setRightPanelOpen(false);
    setSelectedMessage(null);
  };

  const {
    data: messages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["messengerMessages"],
    queryFn: fetchMessages,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <MessageListSkeleton />;

  return (
    <PlatformInbox
      platform="messenger"
      fetchedMessages={messages}
      rightPanelOpen={rightPanelOpen}
      selectedMessage={selectedMessage}
      handleSelectMessage={selectMessageHandler}
      closeRightPanel={closeRightPanel}
    />
  );
}
