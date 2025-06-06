import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import styles from "./Conversation.module.css";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ConversationProps {
  selectedMessage: Message;
}

export default function Conversation({ selectedMessage }: ConversationProps) {
  return (
    <div className="w-full h-full overflow-y-auto p-4">
      <div className="space-y-4">
        {selectedMessage.conversation.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isIncoming ? "justify-center" : "justify-end"
            )}
          >
            <div
              className={cn(
                "w-full md:max-w-[80%] rounded-lg px-4 py-3 shadow-sm break-words whitespace-pre-line",
                message.isIncoming ? "bg-yellow-50" : "bg-blue-500 text-white"
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {message.isIncoming && (
                    <Avatar className="h-10 w-10 border">
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
