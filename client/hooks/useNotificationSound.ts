import { useEffect, useRef } from "react";

export function useNotificationSound(hasNew: boolean, soundUrl: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevHasNew = useRef<boolean>(false);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
    }

    // Play sound only when hasNew changes from false to true
    if (hasNew && !prevHasNew.current) {
      audioRef.current.play().catch(() => {
        // Handle play errors (e.g., user hasn't interacted with page yet)
      });
    }

    prevHasNew.current = hasNew;
  }, [hasNew, soundUrl]);
}
