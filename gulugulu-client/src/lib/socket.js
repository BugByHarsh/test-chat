import { io } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_URL;

if (!URL) console.warn("[socket] VITE_SERVER_URL not set");

export const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
  // A disconnected chat session is terminal. Do not resurrect an old session.
  reconnection: false,
  timeout: 10000,
});