import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getPlatformIcon, getPlatformColor } from "@/lib/platformUtils";

interface MessageListProps {
  messages: Message[];
  activePlatform: string;
  rightPanelOpen: boolean;
  sidebarOpen: boolean;
  tagColors: Record<string, string>;
  selectedMessage: Message | null;
  selectMessageHandler: (message: Message) => void;
  messageStatuses?: Map<string, MessageStatus>;
  temporaryMessages?: Map<string, any>;
}

export default function MessageList({
  messages,
  activePlatform,
  rightPanelOpen,
  sidebarOpen,
  tagColors,
  selectedMessage,
  selectMessageHandler,
  messageStatuses,
  temporaryMessages,
}: MessageListProps) {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto border-r border-gray-200 bg-white",
        rightPanelOpen ? "hidden md:block md:w-1/2 lg:w-2/5" : "w-full"
      )}
    >
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium"></h2>
          <span className="text-sm text-gray-500">
            {messages.length} messages
          </span>
        </div>

        <div className="space-y-3">
          {messages.length > 0 ? (
            messages.map((message) => {
              // Check if this message conversation has any sending status
              const temporaryMessagesArray = temporaryMessages
                ? Array.from(temporaryMessages.values())
                : [];
              const hasSendingMessage = temporaryMessagesArray.some(
                (tempMsg) => {
                  return (
                    tempMsg.isIncoming === false &&
                    ((message as any).channelId ===
                      (selectedMessage as any)?.channelId ||
                      message.senderId === selectedMessage?.senderId)
                  );
                }
              );

              // Get the sending status for visual feedback
              const sendingTempMessage = temporaryMessagesArray.find(
                (tempMsg) =>
                  tempMsg.isIncoming === false &&
                  ((message as any).channelId ===
                    (selectedMessage as any)?.channelId ||
                    message.senderId === selectedMessage?.senderId)
              );

              const sendingStatus = sendingTempMessage
                ? messageStatuses?.get(sendingTempMessage.id)
                : undefined;

              return (
                <Card
                  key={message.id}
                  className={cn(
                    "cursor-pointer overflow-hidden border transition-all hover:shadow-md",
                    selectedMessage?.id === message.id
                      ? "border-blue-200 bg-blue-50/50 ring-1 ring-blue-200"
                      : "",
                    message.unread ? "border-l-4 border-l-purple-900" : "",
                    // Add subtle opacity for sending messages
                    sendingStatus === "sending" ? "opacity-75" : ""
                  )}
                  onClick={() => selectMessageHandler(message)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3 ">
                      <Avatar className="h-10 w-10 border">
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
                              message.unread && "font-semibold "
                            )}
                          >
                            {message.sender}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {message.timestamp}
                            {sendingStatus === "sending" && (
                              <span className="ml-1 text-blue-500">●</span>
                            )}
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
                        <p
                          className={cn(
                            "mt-2 text-sm text-gray-600 line-clamp-2",
                            message.unread && "font-semibold text-gray-900"
                          )}
                        >
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
              );
            })
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <p className="text-gray-500">No messages found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
