"use client";

import { useEffect, useState } from "react";
import { useGenericMutation } from "@/hooks/useMutation";
import { useQuery } from "@tanstack/react-query";
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useDispatch } from "react-redux";
import { setHasNew } from "@/lib/features/platformStatusSlice";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function GmailPage() {
  const dispatch = useDispatch();
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const messageIdFromQuery = searchParams?.get("msg");

  // Set selected message based on query param if it exists
  useEffect(() => {
    if (!selectedMessage && messageIdFromQuery && localMessages?.length) {
      const msg = localMessages.find((m) => m.id === messageIdFromQuery);
      if (msg) {
        if (setSelectedMessage) setSelectedMessage(msg);
        setRightPanelOpen(true);
      }
    }
  }, [localMessages, messageIdFromQuery]);

  // Select message handler to update state and URL
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

  // Mark message as read
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
      setLocalMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, unread: false } : msg
        )
      );
    },
    onError: (err) => {
      console.error("❌ Failed to mark as read", err);
      toast.error("Failed to mark email as read");
    },
  });

  // Fetch emails from Gmail API
  const fetchEmails = async () => {
    const response = await fetch("/api/gmail/emails");
    if (!response.ok) {
      throw new Error("Failed to fetch Gmail messages");
    }
    return response.json();
  };

  //  React Query to fetch emails
  const { data, isLoading, error } = useQuery({
    queryKey: ["gmailEmails"],
    queryFn: fetchEmails,
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
  });

  // Handle message selection from query params
  useEffect(() => {
    if (data) {
      setLocalMessages(data);
    }
  }, [data]);

  useEffect(() => {
    if (localMessages.length > 0) {
      const hasUnread = localMessages.some((msg) => msg.unread);
      dispatch(setHasNew({ platformId: "gmail", hasNew: hasUnread }));
    }
  }, [localMessages, dispatch]);

  if (isLoading) return <MessageListSkeleton />;
  if (error) return <p>Error loading emails.</p>;

  return (
    <PlatformInbox
      platform="gmail"
      fetchedMessages={localMessages}
      selectedMessage={selectedMessage}
      handleSelectMessage={selectMessageHandler}
      rightPanelOpen={rightPanelOpen}
      closeRightPanel={closeRightPanel}
    />
  );
}
