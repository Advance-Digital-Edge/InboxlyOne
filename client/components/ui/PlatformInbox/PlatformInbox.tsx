"use client";

import { useEffect, useState } from "react";
import MessageList from "../Messages/MessageList";
import MessageDetailsWrapper from "@/components/ui/Messages/MessageDetails/MessageDetailsWrapper";
import Searchbar from "@/components/ui/Searchbar/Searchbar";
import PlatformFilter from "@/components/ui/Filter/PlatformFilter";
import { Button } from "@/components/ui/button";
import { X, MoreHorizontal, Search } from "lucide-react";
import { useSidebar } from "@/app/context/SidebarContext";

export default function PlatformInbox({
  platform,
  fetchUrl,
  fetchedMessages,
  onSend,
  sending,
}: {
  platform: string;
  fetchUrl?: string;
  fetchedMessages?: Message[] | null;
  onSend?: (text: string, selectedMessage: Message | null) => void;
  sending?: boolean;
}) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const { sidebarOpen } = useSidebar();

  const selectMessageHandler = (message: Message) => {
    setSelectedMessage(message);
    if (!rightPanelOpen) setRightPanelOpen(true);
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          >
            {rightPanelOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <MoreHorizontal className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <MessageList
          messages={fetchedMessages || []}
          activePlatform={platform}
          rightPanelOpen={rightPanelOpen}
          sidebarOpen={sidebarOpen}
          tagColors={tagColors}
          selectedMessage={selectedMessage}
          selectMessageHandler={selectMessageHandler}
        />
        {rightPanelOpen && (
          <div className="w-full overflow-y-auto bg-white md:w-1/2 lg:w-3/5">
            {selectedMessage ? (
              <MessageDetailsWrapper
                selectedMessage={selectedMessage}
                tagColors={tagColors}
                onSend={(text: string) => onSend?.(text, selectedMessage)}
                sending={sending}
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
