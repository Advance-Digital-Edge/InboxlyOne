"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthProvider";

export default function SlackPage() {
  const [messages, setMessages] = useState<any[]>([]);
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
        console.log(data.messages);
      }
    };
    fetchMessages();
  }, [user?.id]);
  return <PlatformInbox platform="slack" fetchedMessages={messages} />;
}
