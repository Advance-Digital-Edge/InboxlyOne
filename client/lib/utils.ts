import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

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

// Update the transformInstagramData function to handle the new data structure:

export function transformInstagramData(data: any[], currentUserId: string) {
  return data
    .map((thread, threadIndex) => {
      const allMessages = thread.messages || [];

      if (allMessages.length === 0) {
        return null; // Skip conversations with no messages
      }

      // Sort messages by created_time ascending
      allMessages.sort(
        (a: any, b: any) =>
          new Date(a.created_time).getTime() -
          new Date(b.created_time).getTime()
      );

      // Get participants (exclude the page itself) - handle different formats
      let participants = [];
      
      if (thread.participants?.data) {
        participants = thread.participants.data;
      } else if (Array.isArray(thread.participants)) {
        participants = thread.participants;
      } else if (thread.participants) {
        participants = Object.values(thread.participants);
      }
      
      const otherParticipant = Array.isArray(participants) 
        ? participants.find((p: any) => p.id !== currentUserId)
        : null;
        
      const senderName = otherParticipant?.name 
        || otherParticipant?.username 
        || (otherParticipant?.id ? `User ${otherParticipant.id.slice(-4)}` : "Instagram User");
      const senderId = otherParticipant?.id || "unknown";

      const conversation = allMessages.map((msg: any, index: number) => {
        const ts = new Date(msg.created_time).getTime().toString();
        const messageSenderId = msg.from?.id || senderId;
        const messageSenderName = msg.from?.name || senderName;
        
        return {
          id: index,
          senderId: messageSenderId,
          sender: messageSenderName,
          content: msg.message || "",
          timestamp: new Date(msg.created_time).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          ts,
          isIncoming: messageSenderId !== currentUserId,
          unread: false,
        };
      });

      const lastMsg = allMessages[allMessages.length - 1];
      const lastTimestamp = new Date(lastMsg?.created_time || Date.now()).getTime();

      return {
        id: threadIndex,
        sender: senderName,
        senderId: senderId,
        channelId: thread.id,
        avatar: "", // Pages API doesn't provide profile pictures
        preview: lastMsg?.message || "No messages yet",
        timestamp: new Date(lastTimestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        ts: lastTimestamp.toString(),
        platform: "Instagram",
        unread: false,
        tags: [],
        conversation,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null) // Remove null entries with type guard
    .sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));
}

export function transformInstagramNewMessage(
  event: { senderId: string; message: string; timestamp?: number },
  currentUserId: string,
  senderName: string
) {
  const timestamp = event.timestamp || Date.now();
  const date = new Date(timestamp);

  return {
    id: timestamp,
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

// Transform function for Instagram conversations following Messenger pattern
export function transformInstagramMetaData(data: any[], currentUserId: string) {
  return data
    .map((thread, index) => {
      const allMessages = thread.messages || [];

      if (allMessages.length === 0) {
        return null; // Skip conversations with no messages
      }

      // Sort messages by created_time descending to get latest message
      allMessages.sort(
        (a: any, b: any) =>
          new Date(b.created_time).getTime() -
          new Date(a.created_time).getTime()
      );

      // Get participants (exclude the page itself) - handle different formats
      let participants = [];
      
      // Handle different possible participant structures
      if (thread.participants?.data) {
        participants = thread.participants.data;
      } else if (Array.isArray(thread.participants)) {
        participants = thread.participants;
      } else if (thread.participants) {
        // If participants is an object, try to extract data
        participants = Object.values(thread.participants);
      }
      
      console.log("📱 Thread participants structure:", {
        original: thread.participants,
        processed: participants,
        isArray: Array.isArray(participants)
      });
      
      const otherParticipant = Array.isArray(participants) 
        ? participants.find((p: any) => p.id !== currentUserId)
        : null;
        
      // Enhanced name handling with message sender fallback
      let senderName = "Instagram User";
      let senderId = "unknown";
      let avatar = "";
      
      if (otherParticipant) {
        senderId = otherParticipant.id || "unknown";
        
        // Try multiple name sources
        senderName = otherParticipant.name 
          || otherParticipant.username 
          || otherParticipant.display_name
          || (senderId !== "unknown" ? `User ${senderId.slice(-4)}` : "Instagram User");
          
        // Try multiple avatar sources
        avatar = otherParticipant.picture?.data?.url 
          || otherParticipant.profile_picture_url 
          || otherParticipant.avatar_url 
          || "";
      } else if (allMessages.length > 0) {
        // Fallback: try to get user info from message senders
        const firstMessage = allMessages.find((msg: any) => msg.from?.id !== currentUserId);
        if (firstMessage?.from) {
          senderId = firstMessage.from.id || "unknown";
          senderName = firstMessage.from.name 
            || firstMessage.from.username
            || (senderId !== "unknown" ? `User ${senderId.slice(-4)}` : "Instagram User");
          avatar = firstMessage.from.picture?.data?.url 
            || firstMessage.from.profile_picture_url 
            || "";
        }
      }

      console.log("📱 Final participant data:", { senderName, senderId, avatar });

      const lastMsg = allMessages[0]; // Latest message
      const lastTimestamp = new Date(lastMsg?.created_time || Date.now()).getTime();

      return {
        id: index,
        sender: senderName,
        senderId: senderId,
        conversationId: thread.id,
        channelId: thread.id, // Add channelId for compatibility with dashboard
        avatar: avatar, // Use participant avatar if available
        preview: lastMsg?.message || "No messages yet",
        timestamp: getDisplayTime(lastMsg?.created_time || new Date().toISOString()),
        ts: lastTimestamp.toString(),
        platform: "Instagram",
        unread: false, // Instagram API doesn't provide unread count in conversations endpoint
        tags: [],
        conversation: [], // Will be populated when conversation is selected
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null) // Remove null entries with type guard
    .sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));
}
