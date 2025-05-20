import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from "lucide-react";

interface ReplyBoxProps {
  selectedMessage: Message;
  onSend: (text: string) => void;
  sending?: boolean;
}

export default function ReplyBox({ selectedMessage, onSend, sending }: ReplyBoxProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="border-t border-gray-300 p-4">
      <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
        <Textarea
          placeholder={`Reply to ${selectedMessage.sender} on ${selectedMessage.platform}...`}
          className="min-h-24 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={sending}
        />
        <div className="flex items-center justify-between border-t border-gray-300 pt-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button className="gap-1" onClick={handleSend} disabled={sending || !input.trim()}>
            <Send className="h-4 w-4" />
            <span>{sending ? "Sending..." : "Send"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
