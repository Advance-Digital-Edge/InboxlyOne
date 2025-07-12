"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { messengerMessages } from "@/lib/constants";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
export default function MessengerPage() {
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

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

  const selectMessageHandler = (message: any) => {
    setSelectedMessage(message);
    if (!rightPanelOpen) setRightPanelOpen(true);
  };

  // Close right panel and clear selected message
  const closeRightPanel = () => {
    setRightPanelOpen(false);
    setSelectedMessage(null);
  };

  const {
    data: messages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["messengerMessages"],
    queryFn: fetchMessages,
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
  });

  console.log("Messenger messages:", messages);
  return (
    <PlatformInbox
      platform="messenger"
      fetchedMessages={messages}
      rightPanelOpen={rightPanelOpen}
      selectedMessage={selectedMessage}
      handleSelectMessage={selectMessageHandler}
      closeRightPanel={closeRightPanel}
    />
  );
}
