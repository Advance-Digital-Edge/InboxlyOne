import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";

import { instagramMessages } from "@/lib/constants";
export default function InstagramPage() {
  return (
    <PlatformInbox platform="instagram" fetchedMessages={instagramMessages} />
  );
}
