"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { messengerMessages } from "@/lib/constants";
import { useConnectSocket } from "@/hooks/useConnectSocket";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGenericMutation } from "@/hooks/useMutation";
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";
import { transformMessengerNewMessage } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthProvider";
import { toast } from "react-hot-toast";

export default function MessengerPage() {
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Record<string, any[]>>(
    {}
  );

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
    const currentUserId = user?.id;
    const senderName = selectedMessage?.sender;

    const newMessage = transformMessengerNewMessage(
      event,
      currentUserId,
      senderName
    );

    const isActiveChat = selectedMessage?.senderId === event.senderId;

    if (isActiveChat) {
      setSelectedMessage((prev: { conversation: any }) => {
        if (!prev) return prev;
        return {
          ...prev,
          preview: event.message,
          timestamp: newMessage.ts,
          conversation: [...prev.conversation, newMessage],
        };
      });

      markMessengerAsReadMutation.mutate(event.senderId);
    } else {
      // 👇 добавяме съобщението в pending буфера
      setPendingMessages((prev) => {
        const currentMessages = prev[event.senderId] || [];
        return {
          ...prev,
          [event.senderId]: [...currentMessages, newMessage],
        };
      });
    }

    // ✅ Обнови списъка с разговори (винаги)
    queryClient.setQueryData(["messengerMessages"], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((thread: any) =>
        thread.senderId === event.senderId
          ? {
              ...thread,
              preview: event.message,
              timestamp: newMessage.timestamp,
              ts: newMessage.ts,
              unread: true,
            }
          : thread
      );
    });
  });

  const markMessengerAsReadMutation = useGenericMutation({
    mutationFn: async (senderId: string) => {
      const res = await fetch("/api/messenger/markread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark Messenger conversation as seen");
      }

      return res.json();
    },

    onSuccess: (_, senderId) => {
      queryClient.setQueryData(["messengerMessages"], (oldData: any) => {
        if (!oldData) return oldData;

        return oldData.map((thread: any) =>
          thread.senderId === senderId ? { ...thread, unread: false } : thread
        );
      });
    },

    onError: (err) => {
      console.error("❌ Failed to mark Messenger conversation as seen:", err);
      toast.error("Failed to mark Messenger conversation as seen");
    },
  });

  const selectMessageHandler = (message: any) => {
    const pendingForThisSender = pendingMessages[message.senderId] || [];

    const mergedConversation = [
      ...(message.conversation || []),
      ...pendingForThisSender,
    ];

    setSelectedMessage({
      ...message,
      conversation: mergedConversation,
    });

    // 🧹 Изчисти pending буфера за този sender
    setPendingMessages((prev) => {
      const updated = { ...prev };
      delete updated[message.senderId];
      return updated;
    });

    markMessengerAsReadMutation.mutate(message.senderId);

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
