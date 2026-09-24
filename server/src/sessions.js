import crypto from "node:crypto";
import { config } from "./config.js";

const sessions = new Map(); // sessionId -> session
const bySocket = new Map(); // socketId -> sessionId

let counter = 0;
function sid() {
  return `s_${Date.now().toString(36)}_${(++counter).toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function hashIP(ip) {
  if (!ip) return "unknown";
  return crypto.createHash("sha256").update(config.ipHashSalt + ip).digest("hex").slice(0, 16);
}

export function createSession({ socketId, ipHash }) {
  const id = sid();
  const session = {
    id,
    socketId,
    ipHash,
    type: "human",
    state: "idle", // idle | searching | chatting
    mode: "text",
    interests: [],
    roomId: null,
    role: null,
    recentPartners: [], // [{ id, ts }]
    lastActivity: Date.now(),
    msgTimestamps: [],
    lastSkipAt: 0,
    strikes: 0,
    verified: true, // no Turnstile
    createdAt: Date.now(),
    bot: null, // bot state when this session is a bot
  };
  sessions.set(id, session);
  bySocket.set(socketId, id);
  return session;
}

export function getSession(id) {
  return sessions.get(id);
}

export function getBySocket(socketId) {
  const id = bySocket.get(socketId);
  return id ? sessions.get(id) : null;
}

export function rebindSocket(session, newSocketId) {
  bySocket.delete(session.socketId);
  session.socketId = newSocketId;
  bySocket.set(newSocketId, session.id);
}

export function deleteSession(id) {
  const s = sessions.get(id);
  if (!s) return;
  bySocket.delete(s.socketId);
  sessions.delete(id);
}

export function allSessions() {
  return Array.from(sessions.values());
}

export function humanCount() {
  let n = 0;
  for (const s of sessions.values()) if (s.type === "human") n++;
  return n;
}

export function botCount() {
  let n = 0;
  for (const s of sessions.values()) if (s.type === "bot") n++;
  return n;
}
