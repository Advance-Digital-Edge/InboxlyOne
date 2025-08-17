// Sidebar.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Home, Settings, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../dropdown-menu";
import SidebarUserInfoSkeleton from "./SidebarUserInfoSkeleton";
import { ReactElement, use, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { settings } from "@/lib/constants";
import { getPlatformColor } from "@/lib/platformUtils";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import LogoutButton from "../Button/LogoutButton";
interface SidebarProps {
  user: any;
  platforms: Platform[];
  activePlatform: string;
  loading?: boolean;
  setActivePlatform: (platform: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}
export default function Sidebar({
  user,
  platforms,
  activePlatform,
  loading,
  setActivePlatform,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const router = useRouter();

  const platformStatus = useSelector(
    (state: RootState) => state.platformStatus
  );

  const pathname = usePathname();
  // Get the active platform from the URL path
  useEffect(() => {
    const parts = pathname.split("/");
    if (parts.length > 2 && parts[2] !== activePlatform) {
      setActivePlatform(parts[2]);
    }
  }, [pathname, setActivePlatform, activePlatform]);

  const handlePlatformClick = useCallback(
    (platformId: string) => {
      setActivePlatform(platformId);
      router.push(`/dashboard/${platformId}`);
    },
    [router, setActivePlatform]
  );

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
              {platforms.map((platform, index) => {
                console.log(
                  "Active platform:",
                  activePlatform,
                  "Clicked platform:",
                  platform.id,
                  "Platform name:",
                  platform.name
                );
                const hasNew = platformStatus[platform.id]?.hasNew;
                return (
                  <li key={index}>
                    <button
                      className={cn(
                        "flex gap-2 justify-between w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        activePlatform === platform.id
                          ? `bg-slate-200 ${getPlatformColor(platform.name)}`
                          : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => handlePlatformClick(platform.id)}
                      title={platform.name}
                    >
                      <div className="flex items-center gap-2">
                        {platform.icon}
                        {platform.name}
                      </div>
                      {hasNew && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-purple-800 animate-pulse"></span>
                      )}
                    </button>
                  </li>
                );
              })}
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
        {loading ? (
          <SidebarUserInfoSkeleton />
        ) : (
          <div className="border-t border-gray-300 p-4">
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer">
                    <Avatar className="h-10 w-10 border-purple-900 border">
                      <AvatarImage
                        src={user?.user_metadata?.avatar_url}
                        alt="User"
                      />
                      <AvatarFallback>
                        {user?.user_metadata?.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" sideOffset={4} className="w-48">
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    {/* Logout
                    <LogOut color="red" className="h-4 w-4" /> */}
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="ml-3">
                <p className="text-sm font-medium">
                  {user?.user_metadata?.name}
                </p>
                <p className="text-xs text-gray-500 truncate overflow-hidden whitespace-nowrap max-w-[150px]">
                  {user?.user_metadata?.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
