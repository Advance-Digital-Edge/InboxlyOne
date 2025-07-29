"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { messengerMessages } from "@/lib/constants";
import { useConnectSocket } from "@/hooks/useConnectSocket";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGenericMutation } from "@/hooks/useMutation";
import MessageListSkeleton from "@/components/ui/Messages/MessageListSkeleton";
import { getDisplayTime, transformMessengerNewMessage } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthProvider";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setHasNew } from "@/lib/features/platformStatusSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { resetFacebookUnread } from "@/app/actions";

export default function MessengerPage() {
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
    const res = await fetch("/api/messenger/messages");

    if (!res.ok) {
      const data = await res.json();
      throw {
        message: data.error || "Unknown error",
        status: res.status,
      };
    }

    return res.json();
  };

  const fetchFullConversation = async (conversationId: string) => {
    const res = await fetch(`/api/messenger/conversation/${conversationId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch conversation details");
    }

    return res.json();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["messengerMessages"],
    queryFn: fetchMessages,
    refetchOnWindowFocus: false,
  });

  const pageName = data?.page_name;
  const messages = data?.conversations ?? [];

  const sendFacebookMessage = async (recipientId: string, message: string) => {
    const res = await fetch("/api/messenger/sendmessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: recipientId,
        message,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send message");
    }

    return res.json();
  };
  useConnectSocket("facebook_message", (event) => {
    const currentUserId = user?.id;

    const data = queryClient.getQueryData<any>(["messengerMessages"]);
    const senderName =
      data?.conversations?.find((msg: any) => msg.senderId === event.senderId)
        ?.sender || "Unknown";

    const newMessage = transformMessengerNewMessage(
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
      markMessengerAsReadMutation.mutate(event.senderId);
    } else {
      // 👇 добавяме съобщението в pending буфера
      setPendingMessages((prev) => {
        const currentMessages = prev[event.senderId] || [];
        return {
          ...prev,
          [event.senderId]: [...currentMessages, newMessage],
        };
      });
    }

    queryClient.setQueryData(["messengerMessages"], (oldData: any) => {
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

  //   // Update the messengerMessages cache to mark that conversation as read/seen
  //   queryClient.setQueryData(["messengerMessages"], (oldData: any) => {
  //     if (!oldData) return oldData;

  //     return oldData.map((thread: any) =>
  //       thread.senderId === senderId
  //         ? {
  //             ...thread,
  //             unread: false, // Mark as read
  //             lastSeenAt: seenAt, // Optionally store last seen timestamp
  //           }
  //         : thread
  //     );
  //   });

  //   // Optionally update selectedMessage if it matches senderId (e.g. for UI update)
  //   if (selectedMessage?.senderId === senderId) {
  //     setSelectedMessage((prev: any) => {
  //       if (!prev) return prev;
  //       return {
  //         ...prev,
  //         unread: false,
  //         lastSeenAt: seenAt,
  //       };
  //     });
  //   }
  // });

  const sendMessageMutation = useGenericMutation({
    mutationFn: async ({
      senderId,
      message,
    }: {
      senderId: string;
      message: string;
    }) => {
      await sendFacebookMessage(senderId, message);
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
      queryClient.setQueryData(["messengerMessages"], (oldData: any) => {
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

  const markMessengerAsReadMutation = useGenericMutation({
    mutationFn: async (senderId: string) => {
      const res = await fetch("/api/messenger/markread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark Messenger conversation as seen");
      }

      return res.json();
    },

    onSuccess: (_, senderId) => {
      queryClient.setQueryData(["messengerMessages"], (oldData: any) => {
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
      console.error("❌ Failed to mark Messenger conversation as seen:", err);
      toast.error("Failed to mark Messenger conversation as seen");
    },
  });

  const selectMessageHandler = async (message: any) => {
    try {
      const freshConversation = await fetchFullConversation(
        message.conversationId
      );
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

      // 🧠 UPDATE the cached messengerMessages:
      queryClient.setQueryData(["messengerMessages"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          conversations: oldData.conversations.map((thread: any) =>
            thread.conversationId === message.conversationId
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

      markMessengerAsReadMutation.mutate(message.senderId);

      if (!rightPanelOpen) setRightPanelOpen(true);
    } catch (error) {
      toast.error("Could not load conversation details.");
      console.error(error);
    }
    router.push(`/dashboard/messenger?msg=${message.conversationId}`);
    if (message.unread) {
      await resetFacebookUnread(message.senderId);
    }
  };

  // Close right panel and clear selected message
  const closeRightPanel = () => {
    setRightPanelOpen(false);
    setSelectedMessage(null);
  };

  useEffect(() => {
    if (data?.conversations?.length > 0) {
      const hasUnread = data.conversations.some((msg: any) => msg.unread);
      dispatch(setHasNew({ platformId: "messenger", hasNew: hasUnread }));
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
      (m: any) => m.conversationId === messageIdFromQuery
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
      platform="messenger"
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
