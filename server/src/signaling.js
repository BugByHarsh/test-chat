import { getRoom, getPartner } from "./rooms.js";
import { getSession } from "./sessions.js";
import { isBot } from "./bots/botManager.js";

const MAX_SDP_BYTES = 100_000;
const MAX_ICE_BYTES = 20_000;

function validSdp(sdp) {
  return sdp && typeof sdp === "object" &&
    typeof sdp.type === "string" &&
    typeof sdp.sdp === "string" &&
    sdp.sdp.length <= MAX_SDP_BYTES;
}

function validCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") return false;
  if (typeof candidate.candidate !== "string" || candidate.candidate.length > MAX_ICE_BYTES) return false;
  if (candidate.sdpMid !== undefined && typeof candidate.sdpMid !== "string") return false;
  if (candidate.sdpMLineIndex !== undefined && !Number.isInteger(candidate.sdpMLineIndex)) return false;
  return true;
}

export function relayRTC(io, session, event, payload) {
  if (session.state !== "chatting" || !session.roomId) return;
  const room = getRoom(session.roomId);
  if (!room) return;
  const partner = getPartner(room, session.id);
  if (!partner) return;
  const partnerSession = getSession(partner.sessionId);
  if (!partnerSession || isBot(partnerSession)) return;

  if (event === "webrtc_offer" || event === "webrtc_answer") {
    if (!validSdp(payload?.sdp)) return;
  } else if (event === "webrtc_ice") {
    if (!validCandidate(payload?.candidate)) return;
  } else {
    return;
  }

  io.to(partnerSession.socketId).emit(event, payload);
}
