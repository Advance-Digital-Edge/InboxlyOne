"use client";

import { useEffect, useState } from "react";
import { useGenericMutation } from "@/hooks/useMutation";
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useDispatch } from "react-redux";
import { setHasNew } from "@/lib/features/platformStatusSlice";
import { toast } from "react-hot-toast";

export default function GmailPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  const markAsReadMutation = useGenericMutation({
    mutationFn: async (messageId: string) => {
      const res = await fetch("/api/gmail/markread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark email as read");
      }

      return res.json();
    },
    onSuccess: (_, messageId) => {
      // Update the messages state to mark that message as read
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, unread: false } : msg
        )
      );
    },
    onError: (err) => {
      console.error("❌ Failed to mark as read", err);
    },
  });

  useEffect(() => {
    if (!isLoading) {
      const hasUnread = messages.some((msg) => msg.unread);
      if (!hasUnread) {
        dispatch(setHasNew({ platformId: "gmail", hasNew: false }));
      }
    }
  }, [messages, isLoading, dispatch]);

  // fetch messages on mount and set up polling every 15 seconds
  useEffect(() => {
    let intervalId;

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

    intervalId = setInterval(fetchMessages, 15000); 

    return () => {
      clearInterval(intervalId); 
    };
  }, []);

  if (isLoading) return <MessageListSkeleton />;

  return (
    <PlatformInbox
      platform="gmail"
      fetchedMessages={messages}
      onMarkAsRead={markAsReadMutation.mutate}
    />
  );
}
