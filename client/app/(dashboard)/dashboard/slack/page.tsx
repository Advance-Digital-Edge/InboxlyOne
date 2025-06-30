"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthProvider";
import { useSlackSocket } from "@/hooks/useSlackSocket";
import { useSlackConversation } from "@/hooks/useSlackConversation";
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

  // Fetch conversation overview (list of conversations without full message history)
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
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  // Use the new conversation hook for paginated messages
  const {
    messages: conversationMessages,
    isLoading: isLoadingConversation,
    isLoadingMore,
    hasMoreMessages,
    handleScroll,
    scrollContainerRef,
    invalidateConversation,
  } = useSlackConversation(user?.id, selectedMessage?.channelId);

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

  // Auto-mark messages as read when they arrive in the currently opened chat
  useEffect(() => {
    if (selectedMessage && messages?.length > 0 && rightPanelOpen) {
      // Find any unread messages in the current conversation (including the selected message)
      const unreadMessagesInCurrentChat = messages.filter((msg: any) => {
        // Check if it's the same conversation (by senderId or conversation identifier)
        const isSameConversation = msg.senderId === selectedMessage.senderId || 
                                   msg.channelId === selectedMessage.channelId;
        const isUnread = msg.unread === true;
        
        return isSameConversation && isUnread;
      });

      // Mark all unread messages in current chat as read
      unreadMessagesInCurrentChat.forEach((msg: any) => {
        markAsReadMutation.mutate(msg.id);
      });
    }
  }, [messages, selectedMessage, rightPanelOpen]);

  // Listen for real-time Slack events and refresh messages
  useSlackSocket(useCallback((event) => {
    console.log('📨 Real-time Slack event received:', event);
    
    // Always invalidate and refetch the conversation list to show new messages
    queryClient.invalidateQueries({ queryKey: ["slackMessages", user?.id] });
    
    // Also invalidate the current conversation if one is open
    if (selectedMessage?.channelId) {
      console.log('🔄 Invalidating current conversation:', selectedMessage.channelId);
      invalidateConversation();
    }
  }, [queryClient, user?.id, selectedMessage?.channelId, invalidateConversation]));

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
        // Invalidate both the conversation list and current conversation
        queryClient.invalidateQueries({ queryKey: ["slackMessages", user?.id] });
        invalidateConversation();
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

  const selectMessageHandler = (message: any) => {
    if (setSelectedMessage) setSelectedMessage(message);
    router.push(`?msg=${message.id}`, { scroll: false });
    if (!rightPanelOpen) setRightPanelOpen(true);
    
    // Mark the selected message as read if it's unread
    if (message.unread === true) {
      markAsReadMutation.mutate(message.id);
    }
    
    // Also mark any other unread messages in the same conversation as read
    if (messages?.length > 0) {
      const unreadMessagesInSameConversation = messages.filter((msg: any) => {
        const isSameConversation = msg.senderId === message.senderId || 
                                   msg.channelId === message.channelId;
        return isSameConversation && msg.unread === true && msg.id !== message.id;
      });
      
      unreadMessagesInSameConversation.forEach((msg: any) => {
        markAsReadMutation.mutate(msg.id);
      });
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

  // Create the selected message with conversation data just-in-time
  const selectedMessageWithConversation = selectedMessage && conversationMessages?.length > 0 
    ? { ...selectedMessage, conversation: conversationMessages }
    : selectedMessage;

  return (
    <PlatformInbox
      platform="slack"
      fetchedMessages={messages || []}
      onSend={handleSend}
      sending={sending}
      selectedMessage={selectedMessageWithConversation}
      rightPanelOpen={rightPanelOpen}
      handleSelectMessage={selectMessageHandler}
      closeRightPanel={closeRightPanel}
      onScroll={handleScroll}
      scrollRef={scrollContainerRef}
      isLoadingMore={isLoadingMore}
      hasMoreMessages={hasMoreMessages}
    />
  );
}
