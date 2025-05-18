"use client";
import { useState } from "react";
import Sidebar from "@/components/ui/Sidebar/Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { platforms } from "@/lib/constants";
import { useAuth } from "@/app/context/AuthProvider";
import { useSidebar } from "@/app/context/SidebarContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [activePlatform, setActivePlatform] = useState("all");
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { user } = useAuth();

  const setActivePlatformHandler = (platform: string) => {
    setActivePlatform(platform);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar stays here across all dashboard routes */}
      <Sidebar
        user={user}
        platforms={platforms}
        activePlatform={activePlatform}
        setActivePlatform={setActivePlatformHandler}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      {/* Menu button for mobile - always visible */}

      <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Page content for /slack, /gmail, etc. */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
