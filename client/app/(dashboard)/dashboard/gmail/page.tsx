"use client";

import { useEffect, useState } from "react";
import { useGenericMutation } from "@/hooks/useMutation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useDispatch } from "react-redux";
import { setHasNew } from "@/lib/features/platformStatusSlice";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function GmailPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const messageIdFromQuery = searchParams?.get("msg");

  // Fetch emails from Gmail API
  const fetchEmails = async () => {
    const res = await fetch("/api/gmail/emails");

    if (!res.ok) {
      const data = await res.json();
      throw {
        message: data.error || "Unknown error",
        status: res.status,
      };
    }

    return res.json();
  };

  // React Query to fetch emails and cache them
  const {
    data: messages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gmailEmails"],
    queryFn: fetchEmails,
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
  });

  // Set selected message from query param once messages are loaded
  useEffect(() => {
    if (!selectedMessage && messageIdFromQuery && messages?.length) {
      const msg = messages.find((m: any) => m.id === messageIdFromQuery);
      if (msg) {
        setSelectedMessage(msg);
        setRightPanelOpen(true);
      }
    }
  }, [messages, messageIdFromQuery, selectedMessage]);

  // Update Redux state when messages change to reflect unread status
  useEffect(() => {
    if (messages?.length > 0) {
      const hasUnread = messages.some((msg: any) => msg.unread);
      dispatch(setHasNew({ platformId: "gmail", hasNew: hasUnread }));
    }
  }, [messages, dispatch]);



  // Mark message as read mutation, updates React Query cache directly
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
      queryClient.setQueryData(["gmailEmails"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((msg: any) =>
          msg.id === messageId ? { ...msg, unread: false } : msg
        );
      });
    },
    onError: (err) => {
      console.error("❌ Failed to mark as read", err);
      toast.error("Failed to mark email as read");
    },
  });

  // Select message handler updates selected message and URL, triggers mark as read if unread
  const selectMessageHandler = (message: any) => {
    setSelectedMessage(message);
    router.push(`?msg=${message.id}`, { scroll: false });
    if (!rightPanelOpen) setRightPanelOpen(true);
    if (message.unread === true) {
      markAsReadMutation.mutate(message.id);
    }
  };

  // Close right panel and clear selected message
  const closeRightPanel = () => {
    setRightPanelOpen(false);
    setSelectedMessage(null);
  };

  if (error) {
    // @ts-ignore
    if (error.status === 401) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h2 className="text-xl font-semibold mb-2">
            No accounts connected yet
          </h2>
          <p className="text-gray-600">
            Please connect your Gmail account to view your inbox.
          </p>
        </div>
      );
    }
    return (
      <p className="text-center text-red-500 mt-4">Error loading emails</p>
    );
  }

  if (isLoading) return <MessageListSkeleton />;

  return (
    <PlatformInbox
      platform="gmail"
      fetchedMessages={messages || []}
      selectedMessage={selectedMessage}
      handleSelectMessage={selectMessageHandler}
      rightPanelOpen={rightPanelOpen}
      closeRightPanel={closeRightPanel}
    />
  );
}
