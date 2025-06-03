declare global {
  interface Window {
    handleGoogleAuth: (response: any) => void;
    google: any;
  }

  type Platform = {
    id: string;
    name: string;
    icon: ReactElement;
  };

  type ConversationMessage = {
    id: number;
    sender: string;
    content: string;
    timestamp: string;
    isIncoming: boolean;
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
  };
}

export {};
