import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

type RawMessengerMessage = {
  id: string;
  from: { id: string; name: string; email?: string };
  message: string;
  created_time: string;
};

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

export function transformMessengerMetaData(data: any[], currentUserId: string) {
  return data
    .map((thread, index) => {
      const timestamp = new Date(thread.last_message_time).getTime();

      return {
        id: index,
        sender: thread.participant_name || "Unknown",
        senderId: thread.participant_id,
        conversationId: thread.conversation_id,
        avatar: thread.participant_picture_url || "",
        preview: thread.last_message_preview || "No messages yet",
        timestamp: new Date(thread.last_message_time).toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }
        ),
        ts: timestamp.toString(),
        platform: "Messenger",
        unread: thread.unread_count > 0,
        tags: [],
        conversation: [], // ако искаш да го запълниш по-късно с реални съобщения
      };
    })
    .sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));
}

export function transformMessengerNewMessage(
  event: { senderId: string; message: string; timestamp?: number },
  currentUserId: string,
  senderName: string
) {
  const timestamp = event.timestamp || Date.now();
  const date = new Date(timestamp);

  return {
    id: timestamp, // или някакъв уникален ID, примерно timestamp
    senderId: event.senderId,
    sender: senderName,
    content: event.message,
    timestamp: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    ts: timestamp.toString(),
    isIncoming: event.senderId !== currentUserId,
    unread: false,
  };
}

export function transformMessengerRawConversations(
  rawMessage: RawMessengerMessage,
  pageId: string // това е ID-то на твоята Facebook страница
) {
  const timestamp = new Date(rawMessage.created_time).getTime();
  const date = new Date(timestamp);

  return {
    id: rawMessage.id,
    senderId: rawMessage.from.id,
    sender: rawMessage.from.name,
    content: rawMessage.message,
    timestamp: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    ts: timestamp.toString(),
    isIncoming: rawMessage.from.id !== pageId,
    unread: false,
  };
}
