import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { gmailMessages } from "@/lib/constants";

export default function GmailPage() {
  return <PlatformInbox platform="gmail" fetchedMessages={gmailMessages} />;
}
