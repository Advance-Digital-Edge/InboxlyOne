import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get the HTML body from a Gmail message
function getGmailBodyHtml(message: any): string | null {
  const payload = message.payload;

  if (payload?.body?.data && payload.mimeType === "text/html") {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  if (payload?.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/html" && part.body?.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
    }
  }

  return null;
}

// Format the Gmail message data
export function formatGmailData(message: any) {
  const headers = (message.payload?.headers || []).reduce(
    (acc: any, header: any) => {
      acc[header.name] = header.value;
      return acc;
    },
    {}
  );

  return {
    id: message.id,
    sender: headers["From"] || "Unknown sender",
    avatar: "/placeholder.svg?height=40&width=40",
    preview: message.snippet,
    timestamp: (headers["Date"] || "").split(" +")[0], // ето го форматирано
    platform: "Gmail",
    unread: message.labelIds?.includes("UNREAD") ?? false,
    tags: [],
    conversation: [
      {
        id: `${message.id}-1`,
        sender: headers["From"] || "Unknown sender",
        content: getGmailBodyHtml(message),
        timestamp: (headers["Date"] || "").split(" +")[0],
        isIncoming: true,
      },
    ],
  };
}

export function transformMessengerData(data: any[], currentUserId: string) {
  return data
    .map((thread, threadIndex) => {
      const allMessages = thread.messages || [];

      // Sort messages by created_time ascending
      allMessages.sort(
        (a: any, b: any) =>
          new Date(a.created_time).getTime() -
          new Date(b.created_time).getTime()
      );

      const uniqueSenders = new Map();
      allMessages.forEach((msg: any) => {
        uniqueSenders.set(msg.from.id, msg.from.name);
      });

      const conversation = allMessages.map((msg: any, index: number) => {
        const ts = new Date(msg.created_time).getTime().toString();
        return {
          id: index,
          senderId: msg.from.id,
          sender: msg.from.name,
          content: msg.message,
          timestamp: new Date(msg.created_time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          ts,
          isIncoming: msg.from.id !== currentUserId,
          unread: false, // You can implement unread logic if needed
        };
      });

      const lastMsg = allMessages[allMessages.length - 1];
      const lastTimestamp = new Date(lastMsg.created_time).getTime();

      // Pick the sender that's not the current user
      const otherParticipant = [...uniqueSenders.entries()].find(
        ([id]) => id !== currentUserId
      );
      const [senderId, senderName] = otherParticipant || [currentUserId, "You"];

      return {
        id: threadIndex,
        sender: senderName,
        senderId: senderId,
        channelId: thread.conversationId,
        avatar: "", // Optional: if you have profile pics
        preview: lastMsg?.message || "No messages yet",
        timestamp: new Date(lastTimestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        ts: lastTimestamp.toString(),
        platform: "Messenger",
        unread: false, // implement if needed
        tags: [],
        conversation,
      };
    })
    .sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));
}
