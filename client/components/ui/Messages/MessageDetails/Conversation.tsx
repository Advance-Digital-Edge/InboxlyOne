import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import styles from "./Conversation.module.css";

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
                message.isIncoming ? "bg-white" : "bg-blue-500 text-white"
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-4">
                <span className="font-medium">{message.sender}</span>
                <span
                  className={cn(
                    "text-xs",
                    message.isIncoming ? "text-gray-500" : "text-blue-100"
                  )}
                >
                  {message.timestamp}
                </span>
              </div>

              {selectedMessage.platform === "Gmail" && (
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
