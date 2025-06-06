"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthProvider";
import { useSlackSocket } from "@/hooks/useSlackSocket"; // <-- import the hook
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";

export default function SlackPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const { user } = useAuth();

  // Fetch messages function
  const fetchMessages = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch("/api/slack/messages", {
        headers: { "x-user-id": user.id },
      });

      const data = await res.json();
      if (data.ok) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching Slack messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (selectedMessage && messages.length > 0) {
      const updated = messages.find(
        (msg: any) => msg.id === selectedMessage.id
      );
      if (updated) setSelectedMessage(updated);
    }
  }, [messages]);

  // Listen for real-time Slack events and refresh messages
  useSlackSocket((event) => {
    console.log("Received slack_event:", event);
    fetchMessages();
  });

  // Send message handler
  const handleSend = async (text: string, selectedMessage: any) => {
    if (!selectedMessage || !user?.id) return;
    setSending(true);
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
    setSending(false);
    const data = await res.json();
    if (data.ok) {
      // No need to fetch here, real-time will handle it
    } else {
      alert(data.error || "Failed to send message");
    }
  };

  if (isLoading) {
    return <MessageListSkeleton />;
  }

  return (
    <PlatformInbox
      platform="slack"
      fetchedMessages={messages}
      onSend={handleSend}
      sending={sending}
      selectedMessage={selectedMessage}
      setSelectedMessage={setSelectedMessage}
    />
  );
}
