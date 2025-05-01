"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, Mail, Menu, MessageSquare, Slack } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("All")

  // Sample message data
  const messages = [
    {
      id: 1,
      sender: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      snippet:
        "Hi Alex, I've reviewed the website mockups you sent over. I think they look great! Could we schedule a call to discuss a few minor adjustments?",
      timestamp: "10:30 AM",
      source: "Gmail",
    },
    {
      id: 2,
      sender: "David Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      snippet:
        "The latest designs look fantastic! Just one question about the color palette - are we sticking with the blues or exploring other options?",
      timestamp: "Yesterday",
      source: "Slack",
    },
    {
      id: 3,
      sender: "Emma Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      snippet:
        "Invoice #1234 has been paid. Thank you for your work on the logo design project! Looking forward to working with you again.",
      timestamp: "2 days ago",
      source: "Gmail",
    },
    {
      id: 4,
      sender: "Michael Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      snippet:
        "Can you send me the final files for the brochure? We need to send them to the printer by tomorrow afternoon.",
      timestamp: "3 days ago",
      source: "WhatsApp",
    },
    {
      id: 5,
      sender: "Jessica Taylor",
      avatar: "/placeholder.svg?height=40&width=40",
      snippet:
        "Just checking in on the progress of the social media graphics. Our campaign launches next week and we'd love to review the final versions.",
      timestamp: "4 days ago",
      source: "Slack",
    },
  ]

  // Filter messages based on active filter
  const filteredMessages =
    activeFilter === "All" ? messages : messages.filter((message) => message.source === activeFilter)

  // Function to get source icon
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "Gmail":
        return <Mail className="h-4 w-4" />
      case "Slack":
        return <Slack className="h-4 w-4" />
      case "WhatsApp":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  // Function to get source color
  const getSourceColor = (source: string) => {
    switch (source) {
      case "Gmail":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "Slack":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "WhatsApp":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">


      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar */}
        <aside
          className={cn(
            "w-full border-r bg-gray-50 md:w-64 md:flex-shrink-0 md:flex",
            sidebarOpen ? "block" : "hidden md:block",
          )}
        >
          <div className="flex flex-col p-4">
            <h2 className="mb-4 text-lg font-medium">Filters</h2>
            <nav className="flex flex-col space-y-1">
              {["All", "Gmail", "Slack", "WhatsApp"].map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveFilter(filter)
                    setSidebarOpen(false)
                  }}
                >
                  {filter !== "All" && <span className="mr-2">{getSourceIcon(filter)}</span>}
                  {filter}
                </Button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <h2 className="mb-6 text-2xl font-semibold">Messages</h2>
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <Card key={message.id} className="overflow-hidden p-0">
                <div className="flex cursor-pointer flex-col p-4 transition-colors hover:bg-gray-50 md:flex-row md:items-start">
                  <Avatar className="h-10 w-10 md:mr-4">
                    <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.sender} />
                    <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="mt-2 flex-1 md:mt-0">
                    <div className="flex flex-col justify-between md:flex-row">
                      <h3 className="font-medium">{message.sender}</h3>
                      <span className="text-sm text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{message.snippet}</p>
                    <div className="mt-2">
                      <Badge
                        variant="secondary"
                        className={cn("flex w-fit items-center gap-1", getSourceColor(message.source))}
                      >
                        {getSourceIcon(message.source)}
                        {message.source}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
