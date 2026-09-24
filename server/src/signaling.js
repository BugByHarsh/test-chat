import { getRoom, getPartner } from "./rooms.js";
import { getSession } from "./sessions.js";
import { isBot } from "./bots/botManager.js";

export function relayRTC(io, session, event, payload) {
  if (session.state !== "chatting" || !session.roomId) return;
  const room = getRoom(session.roomId);
  if (!room) return;
  const partner = getPartner(room, session.id);
  if (!partner) return;
  const partnerSession = getSession(partner.sessionId);
  if (!partnerSession || isBot(partnerSession)) return;
  io.to(partnerSession.socketId).emit(event, payload);
}