import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_URL;

if (!URL) console.warn("[socket] VITE_SERVER_URL not set");

export const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 600,
  reconnectionDelayMax: 4000,
  timeout: 10000,
});