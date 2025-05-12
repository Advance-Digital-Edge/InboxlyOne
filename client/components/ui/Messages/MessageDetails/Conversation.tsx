import { cn } from "@/lib/utils";

interface ConversationProps {
  selectedMessage: Message;
}

export default function Conversation({ selectedMessage }: ConversationProps) {
  return (
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
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
