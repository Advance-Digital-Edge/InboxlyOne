import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { messengerMessages } from "@/lib/constants";
export default function MessengerPage() {
  return (
    <PlatformInbox platform="messenger" fetchedMessages={messengerMessages} />
  );
}
