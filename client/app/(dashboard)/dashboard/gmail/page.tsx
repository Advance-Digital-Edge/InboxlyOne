"use client";
import PlatformInbox from "@/components/ui/PlatformInbox/PlatformInbox";
import { gmailMessages } from "@/lib/constants";
import { useEffect, useState } from "react";

export default function GmailPage() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Simulate fetching messages from an API
    const fetchMessages = async () => {
      const response = await fetch("/api/gmail/emails");
      const data = await response.json();
      setMessages(data);
    };

    fetchMessages();
  }, []);
  return <PlatformInbox platform="gmail" fetchedMessages={messages} />;
}
