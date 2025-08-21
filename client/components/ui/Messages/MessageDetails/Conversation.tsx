import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import styles from "./Conversation.module.css";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useRef } from "react";
import { Check, CheckCheck, Clock, X } from "lucide-react";

interface ConversationProps {
  selectedMessage: Message;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
  messageStatuses?: Map<string, MessageStatus>;
  temporaryMessages?: Map<string, any>;
}

export default function Conversation({
  selectedMessage,
  onScroll,
  scrollRef,
  isLoadingMore,
  hasMoreMessages,
  messageStatuses,
  temporaryMessages,
}: ConversationProps) {
  const defaultConversationRef = useRef<HTMLDivElement>(null);
  const conversationRef = scrollRef || defaultConversationRef;

  // Function to render status icon for outgoing messages
  const renderStatusIcon = (message: any) => {
    if (message.isIncoming) return null;

    // For Slack messages, use 'ts' field as the identifier, for others use 'id'
    const messageId = message.ts || message.id?.toString();
    const status = message.status || messageStatuses?.get(messageId);

    switch (status) {
      case "sending":
        return (
          <div className="flex items-center">
            <Check className="h-4 w-4 text-white/60" />
          </div>
        );
      case "delivered":
        return (
          <div className="flex items-center">
            <Check className="h-4 w-4 text-white/80" />
            <Check className="h-4 w-4 text-white/80 -ml-1" />
          </div>
        );
      case "seen":
        return (
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-400 font-bold" />
            <Check className="h-4 w-4 text-green-400 font-bold -ml-1" />
          </div>
        );
      case "failed":
        return <X className="h-4 w-4 text-red-400" />;
      default:
        // Show default delivered status for outgoing messages without explicit status
        return (
          <div className="flex items-center">
            <Check className="h-4 w-4 text-white/80" />
            <Check className="h-4 w-4 text-white/80 -ml-1" />
          </div>
        );
    }
  };

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

        {selectedMessage.conversation
          ?.map((message: any, index: number) => {
            // For Slack messages, use 'ts' field as the identifier, for others use 'id'
            const messageId = message.ts || message.id?.toString();
            const status = message.status || messageStatuses?.get(messageId);

            // Skip rendering if this is a temporary message and we have a real message with similar content and timestamp
            const isTemporary = messageId && messageId.startsWith("temp_");
            if (isTemporary) {
              const hasRealVersion = selectedMessage.conversation?.some(
                (m: any, i: number) => {
                  if (i === index || m.ts?.startsWith("temp_")) return false;

                  // Check if content matches and it's from the same sender (you)
                  const contentMatches = m.content === message.content;
                  const sameOutgoingMessage =
                    !m.isIncoming && !message.isIncoming;

                  // Check if timestamps are close (within 30 seconds)
                  const tempTime = parseInt(messageId.replace("temp_", ""));
                  const realTime = parseFloat(m.ts || "0") * 1000;
                  const timeDiff = Math.abs(realTime - tempTime);
                  const closeInTime = timeDiff < 30000; // 30 seconds

                  return contentMatches && sameOutgoingMessage && closeInTime;
                }
              );

              if (hasRealVersion) {
                return null; // Don't render temporary message if real one exists
              }
            }

            const isSlack = selectedMessage.platform === "Slack";

            // Create a stable key that helps prevent re-mounting
            const stableKey = isSlack
              ? messageId.startsWith("temp_")
                ? messageId
                : `real-${messageId}`
              : `${messageId}-${index}`;

            return (
              <div
                key={stableKey}
                className={cn(
                  "flex",
                  message.isIncoming ? "justify-start" : "justify-end"
                )}
              >
                {/* Message bubble  */}
                <div
                  className={cn(
                    "w-full md:max-w-[80%] rounded-lg px-4 py-3 shadow-sm break-words whitespace-pre-line relative",
                    message.isIncoming
                      ? selectedMessage.platform === "Gmail"
                        ? ""
                        : "bg-yellow-50"
                      : "bg-blue-500 text-white",
                    // Smooth transitions for all state changes
                    "transition-all duration-700 ease-in-out"
                    // Apply opacity based on message status, but keep same scale
                    /* !message.isIncoming && status === 'sending' 
                  ? "opacity-60" 
                  : "opacity-100"
                  */
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {message.isIncoming && (
                        <Avatar className="h-10 w-10 border border-blue-900">
                          <AvatarImage
                            src={message.avatar || selectedMessage.avatar || "/placeholder.svg"}
                            alt={message.sender}
                          />
                          <AvatarFallback>
                            {message.sender?.charAt(0)}
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

                  {/* Message content */}
                  <div className="pb-2">
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
                            ],
                          }),
                        }}
                      />
                    ) : (
                      <span className="text-sm pr-8">
                        {message.content || message.message}
                      </span>
                    )}
                  </div>

                  {/* Status indicator in bottom right corner */}
                  {!message.isIncoming && (
                    <div className="absolute bottom-2 right-2 flex items-center">
                      {renderStatusIcon(message)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
          .filter(Boolean)}
      </div>
    </div>
  );
}
