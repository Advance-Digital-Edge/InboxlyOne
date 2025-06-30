declare global {
  interface Window {
    handleGoogleAuth: (response: any) => void;
    google: any;
  }

  type Platform = {
    id: string;
    name: string;
    icon: ReactElement;
    unreadCount?: number; // optional, defaults to 0 or undefined
  };

  type MessageStatus = 'sending' | 'delivered' | 'seen' | 'failed';

  type ConversationMessage = {
    id: number;
    sender: string;
    content: string;
    timestamp: string;
    isIncoming: boolean;
    status?: MessageStatus; // For outgoing messages
  };

  type Message = {
    id: string;
    sender: string;
    senderId?: string;
    avatar: string;
    preview: string;
    timestamp: string;
    platform: string;
    unread: boolean;
    tags: string[];
    conversation: ConversationMessage[];
    status?: MessageStatus; // For tracking message delivery status
  };
}

export {};
