// Sidebar.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Home, Settings, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactElement } from "react";
import { cn } from "@/lib/utils";

export interface Platform {
  id: string;
  name: string;
  icon: ReactElement;
}

interface SidebarProps {
  platforms: Platform[];
  activePlatform: string;
  setActivePlatform: (platform: string) => void;
  getPlatformColor: (platform: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  platforms,
  activePlatform,
  setActivePlatform,
  sidebarOpen,
  setSidebarOpen,
  getPlatformColor,
}: SidebarProps) {
  console.log(activePlatform);
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform border-r border-gray-100 bg-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Sidebar header */}
        <div className="flex h-14 items-center border-b border-gray-100 px-4">
          <h1 className="text-lg font-semibold">Inbox Hub</h1>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="mb-4 px-3 py-2">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Main
            </h2>
            <ul className="space-y-1">
              {platforms.map((platform, index) => (
                <li key={index}>
                  <button
                    key={platform.id}
                    className={cn(
                      "flex gap-2 w-full items-center rounded-md px-3 py-2 text-sm font-medium  transition-colors",
                      activePlatform === platform.id
                        ? `bg-slate-200 ${getPlatformColor(platform.name)}`
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => setActivePlatform(platform.id)}
                    title={platform.name}
                  >
                    {platform.icon}
                    {platform.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="px-3 py-2">
            <h2 className="mb-2 text-xs font-semibold  uppercase tracking-wider text-gray-500">
              Settings
            </h2>
          </div>
        </nav>

        {/* Settings */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="User"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">Alex Johnson</p>
              <p className="text-xs text-gray-500">alex@example.com</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
