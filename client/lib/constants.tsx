import {
  MessageCircle,
  Mail,
  Facebook,
  Instagram,
  Slack,
  UserCog,
} from "lucide-react";

export const messengerMessages = [
  {
    id: 2,
    sender: "David Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    preview:
      "The latest designs look fantastic! Just one question about the color palette - are we sticking with the blues or exploring other options?",
    timestamp: "Yesterday",
    platform: "Messenger",
    unread: false,
    tags: ["Client"],
    conversation: [
      {
        id: 201,
        sender: "David Chen",
        content:
          "The latest designs look fantastic! Just one question about the color palette - are we sticking with the blues or exploring other options?",
        timestamp: "Yesterday",
        isIncoming: true,
      },
    ],
  },
];

export const instagramMessages = [
  {
    id: 4,
    sender: "Michael Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    preview:
      "I saw your portfolio and I'm interested in working with you on a new project for my startup. Do you have availability in the next month?",
    timestamp: "3 days ago",
    platform: "Instagram",
    unread: true,
    tags: ["Lead"],
    conversation: [
      {
        id: 401,
        sender: "Michael Rodriguez",
        content:
          "I saw your portfolio and I'm interested in working with you on a new project for my startup. Do you have availability in the next month?",
        timestamp: "3 days ago",
        isIncoming: true,
      },
    ],
  },
];

export const gmailMessages = [
  {
    id: 1,
    sender: "Sarah Miller",
    avatar: "/placeholder.svg?height=40&width=40",
    preview:
      "Hi Alex, I've reviewed the website mockups you sent over yesterday. I think they look great overall! Could we schedule a call to discuss a few minor adjustments?",
    timestamp: "10:30 AM",
    platform: "Gmail",
    unread: true,
    tags: ["Client", "Needs Follow-up"],
    conversation: [
      {
        id: 101,
        sender: "Sarah Miller",
        content:
          "Hi Alex, I've reviewed the website mockups you sent over yesterday. I think they look great overall! Could we schedule a call to discuss a few minor adjustments?",
        timestamp: "10:30 AM",
        isIncoming: true,
      },
      {
        id: 102,
        sender: "You",
        content:
          "Hi Sarah, I'm glad you like the mockups! I'm available for a call tomorrow between 10 AM and 2 PM. Let me know what time works best for you.",
        timestamp: "10:45 AM",
        isIncoming: false,
      },
    ],
  },
  {
    id: 3,
    sender: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    preview:
      "Invoice #1234 has been paid. Thank you for your work on the logo design project! Looking forward to working with you again.",
    timestamp: "2 days ago",
    platform: "Gmail",
    unread: false,
    tags: ["Client"],
    conversation: [
      {
        id: 301,
        sender: "Emma Wilson",
        content:
          "Invoice #1234 has been paid. Thank you for your work on the logo design project! Looking forward to working with you again.",
        timestamp: "2 days ago",
        isIncoming: true,
      },
    ],
  },
];

// Mock data for messages
export const messages = [
  {
    id: 1,
    sender: "Sarah Miller",
    avatar: "/placeholder.svg?height=40&width=40",
    preview:
      "Hi Alex, I've reviewed the website mockups you sent over yesterday. I think they look great overall! Could we schedule a call to discuss a few minor adjustments?",
    timestamp: "10:30 AM",
    platform: "Gmail",
    unread: true,
    tags: ["Client", "Needs Follow-up"],
    conversation: [
      {
        id: 101,
        sender: "Sarah Miller",
        content:
          "Hi Alex, I've reviewed the website mockups you sent over yesterday. I think they look great overall! Could we schedule a call to discuss a few minor adjustments?",
        timestamp: "10:30 AM",
        isIncoming: true,
      },
      {
        id: 102,
        sender: "You",
        content:
          "Hi Sarah, I'm glad you like the mockups! I'm available for a call tomorrow between 10 AM and 2 PM. Let me know what time works best for you.",
        timestamp: "10:45 AM",
        isIncoming: false,
      },
    ],
  },
  {
    id: 2,
    sender: "David Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    preview:
      "The latest designs look fantastic! Just one question about the color palette - are we sticking with the blues or exploring other options?",
    timestamp: "Yesterday",
    platform: "Messenger",
    unread: false,
    tags: ["Client"],
    conversation: [
      {
        id: 201,
        sender: "David Chen",
        content:
          "The latest designs look fantastic! Just one question about the color palette - are we sticking with the blues or exploring other options?",
        timestamp: "Yesterday",
        isIncoming: true,
      },
    ],
  },
  {
    id: 3,
    sender: "Emma Wilson",
    avatar: "/placeholder.svg?height=40&width=40",
    preview:
      "Invoice #1234 has been paid. Thank you for your work on the logo design project! Looking forward to working with you again.",
    timestamp: "2 days ago",
    platform: "Gmail",
    unread: false,
    tags: ["Client"],
    conversation: [
      {
        id: 301,
        sender: "Emma Wilson",
        content:
          "Invoice #1234 has been paid. Thank you for your work on the logo design project! Looking forward to working with you again.",
        timestamp: "2 days ago",
        isIncoming: true,
      },
    ],
  },
  {
    id: 4,
    sender: "Michael Rodriguez",
    avatar: "/placeholder.svg?height=40&width=40",
    preview:
      "I saw your portfolio and I'm interested in working with you on a new project for my startup. Do you have availability in the next month?",
    timestamp: "3 days ago",
    platform: "Instagram",
    unread: true,
    tags: ["Lead"],
    conversation: [
      {
        id: 401,
        sender: "Michael Rodriguez",
        content:
          "I saw your portfolio and I'm interested in working with you on a new project for my startup. Do you have availability in the next month?",
        timestamp: "3 days ago",
        isIncoming: true,
      },
    ],
  },
  {
    id: 5,
    sender: "Jessica Taylor",
    avatar: "/placeholder.svg?height=40&width=40",
    preview:
      "Just checking in on the progress of the social media graphics. Our campaign launches next week and we'd love to review the final versions.",
    timestamp: "4 days ago",
    platform: "WhatsApp",
    unread: false,
    tags: ["Client", "Needs Follow-up"],
    conversation: [
      {
        id: 501,
        sender: "Jessica Taylor",
        content:
          "Just checking in on the progress of the social media graphics. Our campaign launches next week and we'd love to review the final versions.",
        timestamp: "4 days ago",
        isIncoming: true,
      },
    ],
  },
];

export const platforms = [
  { id: "gmail", name: "Gmail", icon: <Mail className="h-5 w-5" /> },
  {
    id: "messenger",
    name: "Messenger",
    icon: <Facebook className="h-5 w-5" />,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="h-5 w-5" />,
  },
  { id: "slack", name: "Slack", icon: <Slack className="h-5 w-5" /> },
];

export const settings = [
  {
    id: "integrations",
    name: "Integrations",
    icon: <UserCog className="h-5 w-5" />,
  },
];
