"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useEffect, useState } from "react";
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";
import { toast } from "react-hot-toast";

export default function GmailPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/gmail/emails");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching emails:", error);
        toast.error("Failed to fetch Gmail messages.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (isLoading) {
    return <MessageListSkeleton />;
  }
  return <PlatformInbox platform="gmail" fetchedMessages={messages} />;
}
