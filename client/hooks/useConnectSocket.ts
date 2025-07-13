import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000"); // singleton

type EventCallback = (event: any) => void;

export function useConnectSocket(
  eventName: string,
  callback: EventCallback,
  deps: any[] = []
) {
  useEffect(() => {
    if (!eventName || typeof callback !== "function") return;

    const listener = (data: any) => {
      console.log(`Received ${eventName}:`, data);
      callback(data);
    };

    socket.on(eventName, listener);

    return () => {
      socket.off(eventName, listener);
    };
  }, [eventName, callback, ...deps]);
}
