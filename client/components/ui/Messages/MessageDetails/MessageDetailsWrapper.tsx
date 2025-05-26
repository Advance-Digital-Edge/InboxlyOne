import MessageHeader from "./MessageHeader";
import Conversation from "./Conversation";
import ReplyBox from "./ReplyBox";
import { Button } from "../../Button/button";
import { Send } from "lucide-react";

interface MessageDetailsWrapperProps {
  selectedMessage: Message;
  tagColors: Record<string, string>;
  onSend: (text: string) => void;
  sending?: boolean;
}

const openGmailMessage = (messageId: number) => {
  const url = `https://mail.google.com/mail/u/0/#inbox/${messageId}`;
  window.open(url, "_blank");
};

export default function MessageDetailsWrapper({
  selectedMessage,
  tagColors,
  onSend,
  sending,
}: MessageDetailsWrapperProps) {
  return (
    <div className="flex w-full h-full flex-col ">
      <MessageHeader selectedMessage={selectedMessage} tagColors={tagColors} />
      <Conversation selectedMessage={selectedMessage} />
      {selectedMessage.platform === "Gmail" ? (
        <Button
          onClick={() => openGmailMessage(selectedMessage.id)}
          className="mx-auto  my-2 w-4/6"
          size={"sm"}
        >
          REPLY IN GMAIL <Send size={16} className="ml-2" />
        </Button>
      ) : (
        <ReplyBox
          selectedMessage={selectedMessage}
          onSend={onSend}
          sending={sending}
        />
      )}
    </div>
  );
}
