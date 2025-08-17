import { Mail, Facebook, Instagram, Slack } from "lucide-react";

export const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case "gmail":
      return <Mail className="h-4 w-4" />;
    case "messenger":
      return <Facebook className="h-4 w-4" />;
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "slack":
      return <Slack className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
};

export const getPlatformColor = (platform: string) => {
  switch (platform) {
    case "Gmail":
      return "text-red-700 border-red-100";
    case "Messenger":
      return "text-blue-600 border-blue-100";
    case "Instagram":
      return "text-pink-600 border-pink-100";
    case "Slack":
      return "text-purple-600 border-purple-100";
    default:
      return "text-gray-500 border-gray-100";
  }
};
