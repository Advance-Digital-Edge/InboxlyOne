"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthProvider";

export default function SlackPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      const res = await fetch("/api/slack/messages", {
        headers: { "x-user-id": user.id },
      });
      const data = await res.json();
      if (data.ok) {
        setMessages(data.messages);
      }
    };
    fetchMessages();
  }, [user?.id]);

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
      // Optionally, refresh messages
      const res = await fetch("/api/slack/messages", {
        headers: { "x-user-id": user.id },
      });
      const data = await res.json();
      if (data.ok) setMessages(data.messages);
    } else {
      alert(data.error || "Failed to send message");
    }
  };

  return (
    <PlatformInbox
      platform="slack"
      fetchedMessages={messages}
      onSend={handleSend} // <-- pass the handler directly
      sending={sending}
    />
  );
}
