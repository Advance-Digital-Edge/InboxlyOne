"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthProvider";
import { useSlackSocket } from "@/hooks/useSlackSocket"; // <-- import the hook
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useGenericMutation } from "@/hooks/useMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function SlackPage() {
  const [sending, setSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const fetchMessages = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/slack/messages", {
        headers: { "x-user-id": user.id },
      });

      const data = await res.json();
      if (data.ok) {
        return data.messages;
      } else {
        toast.error(data.error || "Failed to fetch Slack messages.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching Slack messages:", error);
      toast.error("Failed to fetch Slack messages.");
      return [];
    }
  };

  const { data: messages, isLoading } = useQuery({
    queryKey: ["slackMessages", user?.id],
    queryFn: fetchMessages,
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
  });

  const markAsReadMutation = useGenericMutation({
    mutationFn: async (messageId: string) => {
      const message = messages.find((msg: any) => msg.id == messageId || msg.id === messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      const res = await fetch("/api/slack/markread", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          messageId: messageId,
          channelId: message.channelId,
          timestamp: message.ts,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark message as read");
      }

      return res.json();
    },
    onSuccess: (_, messageId) => {
      // Update the React Query cache to mark message as read
      queryClient.setQueryData(["slackMessages", user?.id], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((msg: any) =>
          msg.id == messageId || msg.id === messageId ? { ...msg, unread: false } : msg
        );
      });
    },
    onError: (err) => {
      console.error("❌ Failed to mark Slack message as read", err);
      toast.error("Failed to mark message as read");
    },
  });

  useEffect(() => {
    if (selectedMessage && messages?.length > 0) {
      const updated = messages.find(
        (msg: any) => msg.id === selectedMessage.id
      );
      if (updated) setSelectedMessage(updated);
    }
  }, [messages, selectedMessage]);

  // Listen for real-time Slack events and refresh messages
  useSlackSocket((event) => {
    console.log("Received slack_event:", event);
    // Invalidate and refetch the React Query cache
    queryClient.invalidateQueries({ queryKey: ["slackMessages", user?.id] });
  });

  // Send message handler
  const handleSend = async (text: string, selectedMessage: any) => {
    if (!selectedMessage || !user?.id) return;
    setSending(true);
    try {
      const res = await fetch("/api/slack/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          toUserId: selectedMessage.senderId,
          text,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        // Invalidate the query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["slackMessages", user?.id] });
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("Server error: Failed to send message.");
      console.error("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

  const selectMessageHandler = (message: Message) => {
    if (setSelectedMessage) setSelectedMessage(message);
    router.push(`?msg=${message.id}`, { scroll: false });
    if (!rightPanelOpen) setRightPanelOpen(true);
    if (message.unread === true) {
      markAsReadMutation.mutate(message.id);
    }
  };

  // Close the right panel and reset selected message
  const closeRightPanel = () => {
    setRightPanelOpen(false);
    if (setSelectedMessage) setSelectedMessage(null);
  };

  if (isLoading) {
    return <MessageListSkeleton />;
  }

  return (
    <PlatformInbox
      platform="slack"
      fetchedMessages={messages || []}
      onSend={handleSend}
      sending={sending}
      selectedMessage={selectedMessage}
      rightPanelOpen={rightPanelOpen}
      handleSelectMessage={selectMessageHandler}
      closeRightPanel={closeRightPanel}
    />
  );
}
