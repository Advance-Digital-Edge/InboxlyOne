import { useEffect } from "react";
import { io } from "socket.io-client";

export function useSlackSocket(onSlackEvent: (event: any) => void) {
  useEffect(() => {
    const socket = io("http://localhost:4000");

    socket.on("slack_event", (event) => {
      console.log("Received slack_event:", event); // Should log the event object, not a MessageEvent
      onSlackEvent(event);
    });

    return () => {
      socket.disconnect();
    };
  }, [onSlackEvent]);
}