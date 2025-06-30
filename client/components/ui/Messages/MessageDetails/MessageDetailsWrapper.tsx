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
  closeRightPanel: () => void;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
  messageStatuses?: Map<string, MessageStatus>;
  temporaryMessages?: Map<string, any>;
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
  closeRightPanel,
  onScroll,
  scrollRef,
  isLoadingMore,
  hasMoreMessages,
  messageStatuses,
  temporaryMessages,
}: MessageDetailsWrapperProps) {
  return (
    <div className="flex w-full h-full flex-col ">
      <MessageHeader
        selectedMessage={selectedMessage}
        tagColors={tagColors}
        closeRightPanel={closeRightPanel}
      />
      <Conversation 
        selectedMessage={selectedMessage} 
        onScroll={onScroll}
        scrollRef={scrollRef}
        isLoadingMore={isLoadingMore}
        hasMoreMessages={hasMoreMessages}
        messageStatuses={messageStatuses}
        temporaryMessages={temporaryMessages}
      />
      {selectedMessage.platform === "Gmail" ? (
        <Button
          onClick={() => openGmailMessage(Number(selectedMessage.id))}
          className="mx-auto my-2 w-4/6 font-mono"
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
