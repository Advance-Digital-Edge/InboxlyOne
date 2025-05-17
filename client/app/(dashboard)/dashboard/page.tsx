"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Menu,
  MoreHorizontal,
  Search,
  PhoneIcon as WhatsApp,
  X,
} from "lucide-react";
import { platforms, messages } from "@/lib/constants";
import Sidebar from "@/components/ui/Sidebar/Sidebar";
import Integrations from "@/components/sections/Integrations/Integrations";
import Searchbar from "@/components/ui/Searchbar/Searchbar";
import PlatformFilter from "@/components/ui/Filter/PlatformFilter";
import MessageList from "@/components/ui/Messages/MessageList";
import { getPlatformColor, getPlatformIcon } from "@/lib/platformUtils";
import MessageDetailsWrapper from "@/components/ui/Messages/MessageDetails/MessageDetailsWrapper";
import { useAuth } from "../../context/AuthProvider";

export default function Dashboard() {
  const [selectedMessage, setSelectedMessage] = useState(messages[0]);
  const [slackMessages, setSlackMessages] = useState<any[]>([]);
  const [activePlatform, setActivePlatform] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      const res = await fetch("/api/slack/messages", {
        headers: { "x-user-id": user.id },
      });
      const data = await res.json();
      if (data.ok) {
        setSlackMessages(data.messages);
        console.log(data.messages);
      }
    };
    fetchMessages();
  }, [user?.id]);

  const tagColors: Record<string, string> = {
    Client: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    Lead: "bg-green-100 text-green-900 hover:bg-green-200",
    "Needs Follow-up": "bg-amber-100 text-amber-800 hover:bg-amber-200",
  };

  const selectMessageHandler = (message: Message) => {
    setSelectedMessage(message);
    // If the right panel is closed, open it
    if (!rightPanelOpen) setRightPanelOpen(true);
  };

  const setActivePlatformHandler = (platform: string) => {
    setActivePlatform(platform);
  };

  const toggleSidebarHandler = (open: boolean) => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        user={user}
        platforms={platforms}
        activePlatform={activePlatform}
        setActivePlatform={setActivePlatformHandler}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={toggleSidebarHandler}
      />

      {/* Menu button for mobile - always visible */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Central inbox */}
      {activePlatform === "integrations" ? (
        <Integrations />
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
            {/* Search and filters */}
            <div className="flex flex-1 items-center justify-end gap-2 md:justify-center md:gap-4">
              <Searchbar />
              <PlatformFilter />
            </div>

            {/* User profile */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className=""
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
          <div className="flex flex-1 overflow-hidden">
            {/* Message list */}
            <MessageList
              messages={activePlatform === "slack" ? slackMessages : messages}
              platforms={platforms}
              activePlatform={activePlatform}
              rightPanelOpen={rightPanelOpen}
              sidebarOpen={sidebarOpen}
              tagColors={tagColors}
              selectedMessage={selectedMessage}
              selectMessageHandler={selectMessageHandler}
            />

            {/* Right panel - Message details */}
            {rightPanelOpen && (
              <div className="w-full overflow-y-auto bg-white md:w-1/2 lg:w-3/5">
                {selectedMessage ? (
                  <MessageDetailsWrapper
                    selectedMessage={selectedMessage}
                    tagColors={tagColors}
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
      )}
    </div>
  );
}
