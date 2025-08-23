"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { useConnectSocket } from "@/hooks/useConnectSocket";
import { useState, useEffect, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGenericMutation } from "@/hooks/useMutation";
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";
import { getDisplayTime, transformInstagramNewMessage } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthProvider";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setHasNew } from "@/lib/features/platformStatusSlice";
import { useRouter, useSearchParams } from "next/navigation";

function InstagramPageContent() {
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<Record<string, any[]>>(
    {}
  );

  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchMessages = async () => {
    const res = await fetch("/api/instagram/messages");

    if (!res.ok) {
      const data = await res.json();
      throw {
        message: data.error || "Unknown error",
        status: res.status,
      };
    }

    const response = await res.json();
    console.log("📱 Raw Instagram API response:", response);

    // Handle the new response structure - API returns { conversations: [...] }
    if (response.success && response.conversations && response.conversations.length > 0) {
      console.log("📱 Instagram conversations data:", response.conversations);
      
      // Debug: Log each conversation's sender info
      response.conversations.forEach((conv: any, index: number) => {
        console.log(`📱 Conversation ${index}:`, {
          sender: conv.sender,
          senderId: conv.senderId,
          avatar: conv.avatar,
          preview: conv.preview
        });
      });

      return {
        success: true,
        conversations: response.conversations, // Direct use, already transformed
        page_name: response.page_name || "Instagram Business",
      };
    }

    return {
      success: false,
      conversations: [],
      note: response.note || "No Instagram conversations found",
    };
  };

  const fetchFullConversation = async (conversationId: string) => {
    console.log("📱 Fetching conversation details for ID:", conversationId);
    const res = await fetch(`/api/instagram/conversations/${conversationId}`);

    if (!res.ok) {
      const errorData = await res.json();
      console.error("📱 Failed to fetch conversation details:", errorData);
      throw new Error("Failed to fetch conversation details");
    }

    const result = await res.json();
    console.log("📱 Conversation details response:", result);
    return result.conversation?.conversation || result.messages || [];
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["instagramMessages"],
    queryFn: fetchMessages,
    refetchOnWindowFocus: false,
  });

  const pageName = data?.page_name;
  const pageAvatar = (data as any)?.instagram_avatar;
  const messages = data?.conversations ?? [];

  // Debug: Log the messages data to see what names are being displayed
  console.log("📱 Instagram messages for PlatformInbox:", messages);
  messages.forEach((msg: any, index: number) => {
    console.log(`📱 Message card ${index}:`, {
      sender: msg.sender,
      senderId: msg.senderId,
      preview: msg.preview,
      avatar: msg.avatar
    });
  });

  const sendInstagramMessage = async (recipientId: string, message: string) => {
    const res = await fetch("/api/instagram/sendmessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId,
        message,
        threadId: selectedMessage?.channelId,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send message");
    }

    return res.json();
  };

  // Socket listener for incoming Instagram messages
  useConnectSocket("instagram_message", (event) => {
    const currentUserId = user?.id;

    const data = queryClient.getQueryData<any>(["instagramMessages"]);
    const senderName =
      data?.conversations?.find((msg: any) => msg.senderId === event.senderId)
        ?.sender || "Unknown";

    const newMessage = transformInstagramNewMessage(
      event,
      currentUserId,
      senderName
    );

    const isActiveChat =
      selectedMessage?.senderId === event.senderId && rightPanelOpen;

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
      markInstagramAsReadMutation.mutate(event.senderId);
    } else {
      // Add message to pending buffer
      setPendingMessages((prev) => {
        const currentMessages = prev[event.senderId] || [];
        return {
          ...prev,
          [event.senderId]: [...currentMessages, newMessage],
        };
      });
    }

    queryClient.setQueryData(["instagramMessages"], (oldData: any) => {
      if (!oldData || !Array.isArray(oldData.conversations)) return oldData;

      const updatedConversations = oldData.conversations.map((thread: any) => {
        if (thread.senderId === event.senderId) {
          const updatedConversation = thread.conversation
            ? [...thread.conversation, newMessage]
            : [newMessage];

          return {
            ...thread,
            preview: event.message,
            timestamp: newMessage.timestamp,
            ts: newMessage.ts,
            unread: true,
            conversation: updatedConversation,
          };
        }
        return thread;
      });

      return {
        ...oldData,
        conversations: updatedConversations,
      };
    });
  });

  const sendMessageMutation = useGenericMutation({
    mutationFn: async ({
      senderId,
      message,
    }: {
      senderId: string;
      message: string;
    }) => {
      await sendInstagramMessage(senderId, message);
      return {
        senderId,
        preview: message,
      };
    },

    onMutate: async ({ senderId, message }) => {
      setSelectedMessage((prev: any) => {
        if (!prev) return prev;
        const newMsg = {
          id: `temp-${Date.now()}`,
          senderId,
          sender: pageName,
          content: message,
          direction: "outgoing",
          createdAt: new Date().toISOString(),
        };

        return {
          ...prev,
          preview: message,
          timestamp: newMsg.createdAt,
          conversation: [...(prev.conversation || []), newMsg],
        };
      });
    },

    onSuccess: async ({ senderId, preview }) => {
      queryClient.setQueryData(["instagramMessages"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          conversations: oldData.conversations.map((thread: any) =>
            thread.senderId === senderId
              ? {
                  ...thread,
                  preview: preview,
                  timestamp: getDisplayTime(new Date().toISOString()),
                }
              : thread
          ),
        };
      });

      toast.success("Message sent");
    },

    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const markInstagramAsReadMutation = useGenericMutation({
    mutationFn: async (senderId: string) => {
      const res = await fetch("/api/instagram/markread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark Instagram conversation as seen");
      }

      return res.json();
    },

    onSuccess: (_, senderId) => {
      queryClient.setQueryData(["instagramMessages"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          conversations: oldData.conversations.map((thread: any) =>
            thread.senderId === senderId ? { ...thread, unread: false } : thread
          ),
        };
      });
    },

    onError: (err) => {
      console.error("❌ Failed to mark Instagram conversation as seen:", err);
      toast.error("Failed to mark Instagram conversation as seen");
    },
  });

  const selectMessageHandler = async (message: any) => {
    console.log("📱 Selecting Instagram message:", message);
    console.log("📱 Available IDs:", { 
      channelId: message.channelId, 
      conversationId: message.conversationId,
      id: message.id 
    });
    
    // Use channelId if available, otherwise fall back to conversationId
    const conversationId = message.channelId || message.conversationId;
    
    if (!conversationId) {
      toast.error("No conversation ID found. Cannot open chat.");
      console.error("❌ No conversation ID available:", message);
      return;
    }
    
    console.log("📱 Using conversation ID:", conversationId);
    
    try {
      const freshConversation = await fetchFullConversation(conversationId);
      const pendingForThisSender = pendingMessages[message.senderId] || [];
      const mergedConversation = [
        ...freshConversation,
        ...pendingForThisSender.filter(
          (pendingMsg) =>
            !freshConversation.some((msg: any) => msg.id === pendingMsg.id)
        ),
      ];

      setSelectedMessage({
        ...message,
        conversation: freshConversation,
      });

      // Update the cached instagramMessages:
      queryClient.setQueryData(["instagramMessages"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          conversations: oldData.conversations.map((thread: any) =>
            thread.channelId === conversationId || thread.conversationId === conversationId
              ? {
                  ...thread,
                  conversation: freshConversation,
                }
              : thread
          ),
        };
      });

      setPendingMessages((prev) => {
        const updated = { ...prev };
        delete updated[message.senderId];
        return updated;
      });

      markInstagramAsReadMutation.mutate(message.senderId);

      if (!rightPanelOpen) setRightPanelOpen(true);
    } catch (error) {
      toast.error("Could not load conversation details.");
      console.error(error);
    }
    router.push(`/dashboard/instagram?msg=${conversationId}`);
  };

  // Close right panel and clear selected message
  const closeRightPanel = () => {
    setRightPanelOpen(false);
    setSelectedMessage(null);
  };

  useEffect(() => {
    if (data && data.conversations && data.conversations.length > 0) {
      const hasUnread = data.conversations.some((msg: any) => msg.unread) || false;
      dispatch(setHasNew({ platformId: "instagram", hasNew: hasUnread }));
    }
  }, [data, dispatch]);

  // Handle URL query parameter to select a message on page refresh
  useEffect(() => {
    const messageIdFromQuery = searchParams?.get("msg");

    if (!messageIdFromQuery || !data?.conversations?.length) {
      setSelectedMessage(null);
      setRightPanelOpen(false);
      return;
    }

    const conversationSummary = data.conversations.find(
      (m: any) => m.channelId === messageIdFromQuery
    );

    if (!conversationSummary) {
      setSelectedMessage(null);
      setRightPanelOpen(false);
      return;
    }

    const loadConversation = async () => {
      try {
        const fullConversation =
          await fetchFullConversation(messageIdFromQuery);

        setSelectedMessage({
          ...conversationSummary,
          conversation: fullConversation,
        });

        setRightPanelOpen(true);
      } catch (error) {
        console.error(error);
        setSelectedMessage(null);
        setRightPanelOpen(false);
      }
    };

    loadConversation();
  }, [searchParams, data?.conversations]);

  if (isLoading) return <MessageListSkeleton />;
  
  return (
    <PlatformInbox
      platform="instagram"
      fetchedMessages={messages}
      rightPanelOpen={rightPanelOpen}
      selectedMessage={selectedMessage}
      handleSelectMessage={selectMessageHandler}
      closeRightPanel={closeRightPanel}
      onSend={(text, selectedMessage) => {
        if (!selectedMessage?.senderId) {
          toast.error("No sender ID found.");
          return;
        }

        sendMessageMutation.mutate({
          senderId: selectedMessage.senderId,
          message: text,
        });
      }}
    />
  );
}

export default function InstagramPage() {
  return (
    <Suspense fallback={<MessageListSkeleton />}>
      <InstagramPageContent />
    </Suspense>
  );
}
