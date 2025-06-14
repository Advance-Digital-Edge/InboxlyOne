// Sidebar.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Home, Settings, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactElement, use, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { settings } from "@/lib/constants";
import { getPlatformColor } from "@/lib/platformUtils";
import { useRouter, usePathname } from "next/navigation";
interface SidebarProps {
  user: any;
  platforms: Platform[];
  activePlatform: string;
  setActivePlatform: (platform: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({
  user,
  platforms,
  activePlatform,
  setActivePlatform,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const router = useRouter();

  const pathname = usePathname(); 

  useEffect(() => {
    const parts = pathname.split("/");
    if (parts.length > 2 && parts[2] !== activePlatform) {
      setActivePlatform(parts[2]);
    }
  }, [pathname, setActivePlatform, activePlatform]);

  const handlePlatformClick = useCallback((platformId: string) => {
    setActivePlatform(platformId);
    router.push(`/dashboard/${platformId}`);
  }, [router, setActivePlatform]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-60 transform border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Sidebar header */}
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <h1 className="text-lg font-semibold">Inboxlyone</h1>
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
              Platforms
            </h2>
            <ul className="space-y-1">
              {platforms.map((platform, index) => (
                <li key={platform.id}>
                  <button
                    className={cn(
                      "flex gap-2 w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      activePlatform === platform.id
                        ? `bg-slate-200 ${getPlatformColor(platform.name)}`
                        : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => handlePlatformClick(platform.id)}
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
            <ul className="space-y-1">
              {settings.map((setting, index) => (
                <li key={index}>
                  <button
                    key={setting.id}
                    className={cn(
                      "flex gap-2 w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      activePlatform === setting.id
                        ? "bg-slate-200 text-gray-900"
                        : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => handlePlatformClick(setting.id)}
                    title={setting.name}
                  >
                    {setting.icon}
                    {setting.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Settings */}
        <div className="border-t border-gray-300 p-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.user_metadata?.name}</p>
              <p className="text-xs text-gray-500 truncate overflow-hidden whitespace-nowrap max-w-[150px]">
                {user?.user_metadata?.email}
              </p>
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
