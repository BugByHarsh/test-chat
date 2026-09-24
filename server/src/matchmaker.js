import { createRoom } from "./rooms.js";

let queue = [];
const holdTimers = new Map();

export function addToQueue(session) {
  removeFromQueue(session.id);
  queue.push({
    sessionId: session.id,
    interests: session.interests.slice(),
    mode: session.mode,
    joinedAt: Date.now(),
  });
}

export function removeFromQueue(sessionId) {
  queue = queue.filter((q) => q.sessionId !== sessionId);
  clearHoldTimer(sessionId);
}

export function queueSize() {
  return queue.length;
}

export function setHoldTimer(sessionId, fn, ms) {
  clearHoldTimer(sessionId);
  const t = setTimeout(() => {
    holdTimers.delete(sessionId);
    fn();
  }, ms);
  holdTimers.set(sessionId, t);
}

export function clearHoldTimer(sessionId) {
  const t = holdTimers.get(sessionId);
  if (t) {
    clearTimeout(t);
    holdTimers.delete(sessionId);
  }
}

export function findHumanMatch(session, getSession) {
  const candidates = queue.filter(
    (q) => q.sessionId !== session.id && q.mode === session.mode
  );
  if (!candidates.length) return null;

  const now = Date.now();
  let best = null;
  let bestScore = -Infinity;

  for (const c of candidates) {
    const other = getSession(c.sessionId);
    if (!other) continue;
    const overlap = c.interests.filter((i) => session.interests.includes(i)).length;
    const score = overlap * 3 + (now - c.joinedAt) / 1000;
    if (score > bestScore) {
      bestScore = score;
      best = { c, other };
    }
  }
  if (!best) return null;

  removeFromQueue(session.id);
  removeFromQueue(best.other.id);

  const room = createRoom(session, best.other, session.mode);
  session.state = "chatting";
  session.roomId = room.id;
  best.other.state = "chatting";
  best.other.roomId = room.id;

  const meRole = room.members.find((m) => m.sessionId === session.id).role;
  const otherRole = room.members.find((m) => m.sessionId === best.other.id).role;

  return {
    room,
    a: { session, role: meRole },
    b: { session: best.other, role: otherRole },
  };
}

export function makeBotRoom(humanSession, botSession) {
  const room = createRoom(humanSession, botSession, humanSession.mode);
  humanSession.state = "chatting";
  humanSession.roomId = room.id;
  botSession.state = "chatting";
  botSession.roomId = room.id;

  const meRole = room.members.find((m) => m.sessionId === humanSession.id).role;
  const botRole = room.members.find((m) => m.sessionId === botSession.id).role;

  return {
    room,
    a: { session: humanSession, role: meRole },
    b: { session: botSession, role: botRole },
  };
}