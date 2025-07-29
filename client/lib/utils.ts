import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
;

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

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: (input: string) => (input === "now" ? input : `${input} ago`),
    s: "now",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

export const getDisplayTime = (dateStr: string) => {
  let cleaned = dateStr;

  // Handle +0000 (Messenger raw format) ➜ convert to Z
  if (/\+0000$/.test(dateStr)) {
    cleaned = dateStr.replace(/\+0000$/, "Z");
  }

  // Handle missing timezone ➜ add Z (for previews or other sources)
  else if (!/Z|[+-]\d{2}:\d{2}$/.test(dateStr)) {
    cleaned = dateStr + "Z";
  }

  const date = dayjs(cleaned);
  if (!date.isValid()) return "Invalid date";

  const daysDiff = dayjs().diff(date, "day");

  if (daysDiff > 1) {
    return date.format("M/D/YYYY");
  }

  return date.fromNow();
};

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
        timestamp: getDisplayTime(thread.last_message_time),
        ts: timestamp.toString(),
        platform: "Messenger",
        unread: thread.unread_count > 0,
        tags: [],
        conversation: [],
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

  return {
    id: timestamp,
    senderId: event.senderId,
    sender: senderName,
    content: event.message,
    timestamp: getDisplayTime(new Date(timestamp).toISOString()), // <-- use getDisplayTime here
    ts: timestamp.toString(),
    isIncoming: event.senderId !== currentUserId,
    unread: false,
  };
}

export function transformMessengerRawConversations(
  rawMessage: RawMessengerMessage,
  pageId: string
) {
  const timestamp = new Date(rawMessage.created_time).getTime();

  return {
    id: rawMessage.id,
    senderId: rawMessage.from.id,
    sender: rawMessage.from.name,
    content: rawMessage.message,
    timestamp: getDisplayTime(rawMessage.created_time), // <-- use getDisplayTime here
    ts: timestamp.toString(),
    isIncoming: rawMessage.from.id !== pageId,
    unread: false,
  };
}
