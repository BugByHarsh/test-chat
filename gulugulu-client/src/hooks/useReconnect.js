import { useEffect, useRef } from "react";
import { useChat } from "../store/chatStore";

export function useReconnect() {
  const { connected, everConnected, status, pushSystem } = useChat();
  const wasChatting = useRef(false);

  useEffect(() => {
    if (status === "chatting") wasChatting.current = true;
    if (status === "idle") wasChatting.current = false;
  }, [status]);

  useEffect(() => {
    if (connected && everConnected && wasChatting.current) {
      pushSystem("Reconnected.");
      wasChatting.current = false;
    }
  }, [connected, everConnected, pushSystem]);

  return { connected, everConnected };
}