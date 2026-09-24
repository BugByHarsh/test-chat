import http from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import { config } from "./config.js";
import {
  createSession, deleteSession, hashIP, humanCount, botCount, allSessions,
} from "./sessions.js";
import { allRooms } from "./rooms.js";
import { isBanned } from "./moderation.js";
import { snapshot as metricsSnapshot } from "./metrics.js";
import { registerHandlers } from "./socketHandlers.js";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.get("/metrics", (req, res) => {
  res.json({
    ...metricsSnapshot(),
    sessions: allSessions().length,
    humans: humanCount(),
    bots: botCount(),
    rooms: allRooms().length,
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.clientOrigin, credentials: true },
  transports: ["websocket", "polling"],
  maxHttpBufferSize: 1_000_000,
});

io.use((socket, next) => {
  const ip =
    (socket.handshake.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    socket.handshake.address ||
    "unknown";
  const ipHash = hashIP(ip);
  const banned = isBanned(ipHash);
  if (banned) {
    const err = new Error("banned");
    err.data = { code: "IP_BANNED", message: `You are banned (${banned.reason}).` };
    return next(err);
  }
  socket.data.ipHash = ipHash;
  next();
});

io.on("connection", (socket) => {
  const session = createSession({
    socketId: socket.id,
    ipHash: socket.data.ipHash,
  });

  registerHandlers(io, socket);
  broadcastOnline();

  socket.on("disconnect", () => {
    deleteSession(session.id);
    broadcastOnline();
  });
});

function broadcastOnline() {
  io.emit("online_count", { count: humanCount() });
}

setInterval(broadcastOnline, 10_000);

server.listen(config.port, () => {
  console.log(`[gulugulu] server listening on http://localhost:${config.port}`);
  console.log(`[gulugulu] allowing client origin ${config.clientOrigin}`);
});