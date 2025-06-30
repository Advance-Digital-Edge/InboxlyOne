import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import styles from "./Conversation.module.css";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";

interface ConversationProps {
  selectedMessage: Message;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
}

export default function Conversation({ 
  selectedMessage, 
  onScroll, 
  scrollRef, 
  isLoadingMore, 
  hasMoreMessages 
}: ConversationProps) {
  const defaultConversationRef = useRef<HTMLDivElement>(null);
  const conversationRef = scrollRef || defaultConversationRef;

  // Auto-scroll to bottom only for the first load or when new messages arrive
  // Don't auto-scroll when loading more historical messages
  useEffect(() => {
    if (conversationRef.current && !isLoadingMore) {
      // Always scroll to bottom for new conversations or when new messages arrive
      // Only avoid scrolling when we're loading more historical messages
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [selectedMessage.conversation?.length, selectedMessage.id, isLoadingMore]);

  return (
    <div 
      ref={conversationRef} 
      className="w-full h-full overflow-y-auto p-4"
      onScroll={onScroll}
    >
      <div className="space-y-4">
        {/* Loading indicator at the top */}
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Show "Load more" hint if there are more messages and not currently loading */}
        {hasMoreMessages && !isLoadingMore && (
          <div className="flex justify-center py-2">
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Scroll up to load more messages
            </div>
          </div>
        )}
        
        {selectedMessage.conversation?.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isIncoming ? "justify-center" : "justify-end"
            )}
          >
            {/* Message bubble  */}
            <div
              className={cn(
                "w-full md:max-w-[80%] rounded-lg px-4 py-3 shadow-sm break-words whitespace-pre-line",
                message.isIncoming
                  ? selectedMessage.platform === "Gmail"
                    ? ""
                    : "bg-yellow-50"
                  : "bg-blue-500 text-white"
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {message.isIncoming && (
                    <Avatar className="h-10 w-10 border border-blue-900">
                      <AvatarImage
                        src={selectedMessage.avatar || "/placeholder.svg"}
                        alt={message.sender}
                      />
                      <AvatarFallback>
                        {message.sender.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span className="font-medium">{message.sender}</span>
                </div>
                <span
                  className={cn(
                    "text-xs",
                    message.isIncoming ? "text-gray-500" : "text-blue-100"
                  )}
                >
                  {message.timestamp}
                </span>
              </div>

              {/* Render HTML content for Gmail messages */}
              {selectedMessage.platform === "Gmail" ? (
                <div
                  className={styles.messageHtml}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(message.content, {
                      FORBID_TAGS: ["style", "script", "iframe", "form"],
                      ADD_ATTR: ["style"],
                      ALLOWED_ATTR: [
                        "href",
                        "src",
                        "alt",
                        "title",
                        "style",
                        "width",
                        "height",
                      ], // avoid random fixed widths
                    }),
                  }}
                />
              ) : (
                <span className="text-sm">{message.content}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
