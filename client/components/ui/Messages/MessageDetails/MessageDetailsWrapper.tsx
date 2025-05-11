import MessageHeader from "./MessageHeader";
import Conversation from "./Conversation";
import ReplyBox from "./ReplyBox";

interface MessageDetailsWrapperProps {
  selectedMessage: Message;
  tagColors: Record<string, string>;
}

export default function MessageDetailsWrapper({
  selectedMessage,
  tagColors,
}: MessageDetailsWrapperProps) {
  return (
    <div className="flex h-full flex-col">
      <MessageHeader selectedMessage={selectedMessage} tagColors={tagColors} />
      <Conversation selectedMessage={selectedMessage} />
      <ReplyBox selectedMessage={selectedMessage} />
    </div>
  );
}
