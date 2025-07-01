import { useEffect, useRef } from "react";

export function useTitleFlasher(hasNew: boolean, flashText = "New message") {
  const originalTitle = useRef<string>("");

  useEffect(() => {
    // Set original title only once, on mount
    if (!originalTitle.current) {
      originalTitle.current = document.title;
    }

    let flashInterval: NodeJS.Timeout | null = null;

    if (!hasNew) {
      if (flashInterval) {
        clearInterval(flashInterval);
      }
      document.title = originalTitle.current;
      return;
    }

    flashInterval = setInterval(() => {
      document.title =
        document.title === originalTitle.current
          ? flashText
          : originalTitle.current;
    }, 1000);

    return () => {
      if (flashInterval) clearInterval(flashInterval);
      document.title = originalTitle.current;
    };
  }, [hasNew, flashText]);
}
