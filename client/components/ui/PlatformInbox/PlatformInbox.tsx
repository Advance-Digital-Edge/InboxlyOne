"use client";

import { useEffect, useState } from "react";
import MessageList from "../Messages/MessageList";
import MessageDetailsWrapper from "@/components/ui/Messages/MessageDetails/MessageDetailsWrapper";
import Searchbar from "@/components/ui/Searchbar/Searchbar";
import PlatformFilter from "@/components/ui/Filter/PlatformFilter";
import { Button } from "@/components/ui/button";
import { X, MoreHorizontal, Search } from "lucide-react";
import { useSidebar } from "@/app/context/SidebarContext";
import { useRouter, useSearchParams } from "next/navigation";
import { set } from "react-hook-form";

export default function PlatformInbox({
  platform,
  fetchUrl,
  fetchedMessages,
  onSend,
  sending,
  selectedMessage,
  setSelectedMessage,
}: {
  platform: string;
  fetchUrl?: string;
  fetchedMessages?: Message[] | null;
  onSend?: (text: string, selectedMessage: Message | null) => void;
  sending?: boolean;
  selectedMessage?: Message | null;
  setSelectedMessage?: (msg: Message | null) => void;
}) {
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const { sidebarOpen } = useSidebar();


  // Handle initial message selection from query params
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageIdFromQuery = searchParams?.get("msg");

  // Set selected message based on query param if it exists
  useEffect(() => {
    if (!selectedMessage && messageIdFromQuery && fetchedMessages?.length) {
      const msg = fetchedMessages.find((m) => m.id === messageIdFromQuery);
      if (msg) {
        if (setSelectedMessage) setSelectedMessage(msg);
        setRightPanelOpen(true);
      }
    }
  }, [fetchedMessages, messageIdFromQuery]);

  
  // Select message handler to update state and URL
  const selectMessageHandler = (message: Message) => {
    if (setSelectedMessage) setSelectedMessage(message);
    router.push(`?msg=${message.id}`, { scroll: false });
    if (!rightPanelOpen) setRightPanelOpen(true);
  };

  // Close the right panel and reset selected message 
  const closeRightPanel = () => {
    setRightPanelOpen(false);
    setSelectedMessage(null);
    // router.push("/dashboard", { scroll: false });
  };

  const tagColors = {
    Client: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    Lead: "bg-green-100 text-green-900 hover:bg-green-200",
    "Needs Follow-up": "bg-amber-100 text-amber-800 hover:bg-amber-200",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex flex-1 items-center justify-end gap-2 md:justify-center md:gap-4">
          <Searchbar />
          <PlatformFilter />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <MessageList
          messages={Array.isArray(fetchedMessages) ? fetchedMessages : []}
          activePlatform={platform}
          rightPanelOpen={rightPanelOpen}
          sidebarOpen={sidebarOpen}
          tagColors={tagColors}
          selectedMessage={selectedMessage ?? null}
          selectMessageHandler={selectMessageHandler}
        />
        {rightPanelOpen && (
          <div className="w-full md:w-4/6  overflow-y-auto bg-white  ">
            {selectedMessage ? (
              <MessageDetailsWrapper
                selectedMessage={selectedMessage}
                tagColors={tagColors}
                onSend={(text: string) => onSend?.(text, selectedMessage)}
                sending={sending}
                closeRightPanel={closeRightPanel}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-500">Select a message to view</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
