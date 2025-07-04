"use client"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useTitleFlasher } from "@/hooks/useTitleFlasher";
import { useNotificationSound } from "@/hooks/useNotificationSound";

export default function NotificationListener() {
  const platformStatus = useSelector(
    (state: RootState) => state.platformStatus
  );

  // State to track if page is visible or not
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Check if any platform has new notifications
  const hasAnyNew = Object.values(platformStatus).some(
    (platform) => platform.hasNew
  );

  // Only flash title and play sound if user is NOT on the app tab
  useTitleFlasher(!isPageVisible && hasAnyNew, "📬 New messages!");
  useNotificationSound(!isPageVisible && hasAnyNew, "/sounds/notification.mp3");

  return null;
}
