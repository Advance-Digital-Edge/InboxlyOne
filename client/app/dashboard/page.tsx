"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  Facebook,
  Filter,
  Instagram,
  Mail,
  Menu,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  Settings,
  Tag,
  MessageCircle,
  Slack,
  PhoneIcon as WhatsApp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { platforms, messages } from "@/lib/constants";
import Sidebar from "@/components/ui/Sidebar/Sidebar";

export default function Dashboard() {
  const [selectedMessage, setSelectedMessage] = useState(messages[0]);
  const [activePlatform, setActivePlatform] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Filter messages based on active platform
  const filteredMessages =
    activePlatform === "all"
      ? messages
      : messages.filter(
          (message) => message.platform.toLowerCase() === activePlatform
        );

  const tagColors: Record<string, string> = {
    Client: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    Lead: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    "Needs Follow-up": "bg-amber-100 text-amber-800 hover:bg-amber-200",
  };

  // Function to get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Gmail":
        return <Mail className="h-4 w-4" />;
      case "Messenger":
        return <Facebook className="h-4 w-4" />;
      case "Instagram":
        return <Instagram className="h-4 w-4" />;
      case "WhatsApp":
        return <WhatsApp className="h-4 w-4" />;
      case "Slack":
        return <Slack className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Gmail":
        return "text-red-700 border-red-100";
      case "Messenger":
        return "text-blue-600 border-blue-100";
      case "Instagram":
        return "text-pink-600 border-pink-100";
      case "Slack":
        return "text-purple-600 border-purple-100";
    }
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
        platforms={platforms}
        activePlatform={activePlatform}
        setActivePlatform={setActivePlatform}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        getPlatformColor={getPlatformColor}
      />

      {/* Central inbox */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Search and filters */}
          <div className="flex flex-1 items-center justify-end gap-2 md:justify-center md:gap-4">
            <div className="relative hidden md:block md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search across all messages..."
                className="w-full border-none bg-gray-50 pl-9 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:ring-offset-0"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              <span className="hidden md:inline">Filter</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
            >
              {rightPanelOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <MoreHorizontal className="h-5 w-5" />
              )}
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="User"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Message list */}
          <div
            className={cn(
              "flex-1 overflow-y-auto border-r border-gray-100 bg-white",
              rightPanelOpen ? "hidden md:block md:w-1/2 lg:w-2/5" : "w-full"
            )}
          >
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  {activePlatform === "all"
                    ? "All Messages"
                    : platforms.find((p) => p.id === activePlatform)?.name}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredMessages.length} messages
                </span>
              </div>

              <div className="space-y-3">
                {filteredMessages.map((message) => (
                  <Card
                    key={message.id}
                    className={cn(
                      "cursor-pointer overflow-hidden border transition-all hover:shadow-md",
                      selectedMessage.id === message.id
                        ? "border-blue-200 bg-blue-50/50 ring-1 ring-blue-200"
                        : "",
                      message.unread ? "border-l-4 border-l-blue-500" : ""
                    )}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!rightPanelOpen) setRightPanelOpen(true);
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={message.avatar || "/placeholder.svg"}
                            alt={message.sender}
                          />
                          <AvatarFallback>
                            {message.sender.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3
                              className={cn(
                                "font-medium",
                                message.unread && "font-semibold"
                              )}
                            >
                              {message.sender}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {message.timestamp}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                getPlatformColor(message.platform)
                              )}
                            >
                              {getPlatformIcon(message.platform)}
                              <span className="ml-0.5">{message.platform}</span>
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {message.preview}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={cn("text-xs", tagColors[tag])}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel - Message details */}
          {rightPanelOpen && (
            <div className="w-full overflow-y-auto bg-white md:w-1/2 lg:w-3/5">
              {selectedMessage ? (
                <div className="flex h-full flex-col">
                  {/* Message header */}
                  <div className="border-b border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={selectedMessage.avatar || "/placeholder.svg"}
                            alt={selectedMessage.sender}
                          />
                          <AvatarFallback>
                            {selectedMessage.sender.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {selectedMessage.sender}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                getPlatformColor(selectedMessage.platform)
                              )}
                            >
                              {getPlatformIcon(selectedMessage.platform)}
                              <span className="ml-0.5">
                                {selectedMessage.platform}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Tag className="h-4 w-4" />
                          <span className="hidden md:inline">Manage Tags</span>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedMessage.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className={cn("text-xs", tagColors[tag])}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Conversation */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {selectedMessage.conversation.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.isIncoming ? "justify-start" : "justify-end"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
                              message.isIncoming
                                ? "bg-white"
                                : "bg-blue-500 text-white"
                            )}
                          >
                            <div className="mb-1 flex items-center justify-between gap-4">
                              <span className="font-medium">
                                {message.sender}
                              </span>
                              <span
                                className={cn(
                                  "text-xs",
                                  message.isIncoming
                                    ? "text-gray-500"
                                    : "text-blue-100"
                                )}
                              >
                                {message.timestamp}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply box */}
                  <div className="border-t border-gray-100 p-4">
                    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                      <Textarea
                        placeholder={`Reply to ${selectedMessage.sender} on ${selectedMessage.platform}...`}
                        className="min-h-24 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                        <Button variant="ghost" size="icon">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button className="gap-1">
                          <Send className="h-4 w-4" />
                          <span>Send</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">Select a message to view</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
