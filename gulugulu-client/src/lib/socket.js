import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_URL;

if (!URL) console.warn("[socket] VITE_SERVER_URL not set");

export const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
  // Reconnect the Socket.IO transport after an unexpected network drop, without restoring the old chat/session.
  reconnection: true,
  timeout: 10000,
});