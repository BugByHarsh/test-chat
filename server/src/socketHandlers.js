import { config } from "./config.js";
import { getSession, getBySocket } from "./sessions.js";
import { getRoom, deleteRoom, getPartner, pushRoomMessage } from "./rooms.js";
import {
  addToQueue, removeFromQueue, findHumanMatch, makeBotRoom,
  queueSize, setHoldTimer, clearHoldTimer,
} from "./matchmaker.js";
import {
  spawnBot, startBot, botOnUserMessage, destroyBot, isBot,
} from "./bots/botManager.js";
import { checkMessageRate, checkSkipCooldown } from "./rateLimit.js";
import { checkMessage, addReport } from "./moderation.js";
import { relayRTC } from "./signaling.js";
import { inc } from "./metrics.js";

const MAX_REPORT_FRAME_BYTES = 700_000;

export function canStartSearch(session) {
  return !!session?.ageConfirmed;
}

export function registerHandlers(io, socket) {
  const session = getBySocket(socket.id);
  if (!session) return;

  const S = (id) => getSession(id);

  socket.on("confirm_age", () => {
    session.ageConfirmed = true;
  });

  socket.on("find_partner", ({ mode, interests } = {}) => {
    if (!canStartSearch(session)) {
      socket.emit("error", {
        code: "AGE_REQUIRED",
        message: "You must confirm that you are 18 or older.",
      });
      return;
    }

    if (!["text", "voice", "video"].includes(mode)) mode = "text";
    if (!Array.isArray(interests)) interests = [];
    interests = interests.filter((i) => typeof i === "string").slice(0, 5);

    if (session.state !== "idle") {
      socket.emit("error", { code: "BAD_STATE", message: "Already in a session." });
      return;
    }

    session.mode = mode;
    session.interests = interests;
    session.state = "searching";

    socket.emit("waiting", { position: queueSize() + 1 });

    const match = findHumanMatch(session, S);
    if (match) {
      finalizeHumanMatch(io, match);
      return;
    }

    addToQueue(session);

    setHoldTimer(
      session.id,
      () => {
        if (session.state !== "searching") return;

        const late = findHumanMatch(session, S);
        if (late) {
          finalizeHumanMatch(io, late);
          return;
        }

        if (mode === "text") {
          const bot = spawnBot(session, interests);
          if (bot) {
            removeFromQueue(session.id);
            const { room, a, b } = makeBotRoom(session, bot);
            finalizeBotMatch(io, room, a, b);
            return;
          }
        }

        socket.emit("waiting", { position: queueSize() });
      },
      config.holdTimerMs
    );
  });

  socket.on("cancel_search", () => {
    if (session.state !== "searching") return;
    removeFromQueue(session.id);
    clearHoldTimer(session.id);
    session.state = "idle";
    socket.emit("error", { code: "CANCELLED", message: "Search cancelled." });
  });

  socket.on("message", ({ text } = {}) => {
    if (session.state !== "chatting" || !session.roomId) return;
    if (typeof text !== "string") return;
    text = text.trim();
    if (!text) return;

    const rl = checkMessageRate(session, config.msgRateLimit, config.msgRateWindowMs);
    if (!rl.ok) {
      socket.emit("rate_limited", {
        code: "MSG_RATE",
        message: "Slow down.",
        retryAfter: rl.retryAfter,
      });
      return;
    }

    const check = checkMessage(text);
    if (!check.ok) {
      session.strikes++;
      socket.emit("error", {
        code: "FILTERED",
        message: `Message blocked (${check.reason}).`,
      });
      return;
    }

    text = text.slice(0, config.maxMessageLen);

    const room = getRoom(session.roomId);
    if (!room) return;
    pushRoomMessage(room, session.id, text);

    const partner = getPartner(room, session.id);
    if (!partner) return;
    const partnerSession = S(partner.sessionId);
    if (!partnerSession) return;

    io.to(partnerSession.socketId).emit("message", { text, ts: Date.now() });

    if (isBot(partnerSession)) {
      botOnUserMessage({
        sessionId: partnerSession.id,
        text,
        emit: (reply) => {
          pushRoomMessage(room, partnerSession.id, reply);
          io.to(session.socketId).emit("message", { text: reply, ts: Date.now() });
        },
      });
    }

    inc("messagesSent");
  });

  socket.on("typing", ({ isTyping } = {}) => {
    if (session.state !== "chatting" || !session.roomId) return;
    const room = getRoom(session.roomId);
    if (!room) return;
    const partner = getPartner(room, session.id);
    if (!partner) return;
    const partnerSession = S(partner.sessionId);
    if (!partnerSession || isBot(partnerSession)) return;
    io.to(partnerSession.socketId).emit("partner_typing", { isTyping: !!isTyping });
  });

  socket.on("video_reveal", () => {
    if (session.state !== "chatting" || !session.roomId || session.mode !== "video") return;

    const room = getRoom(session.roomId);
    if (!room) return;

    const partner = getPartner(room, session.id);
    if (!partner) return;

    const partnerSession = S(partner.sessionId);
    if (!partnerSession || isBot(partnerSession) || partnerSession.mode !== "video") return;

    io.to(partnerSession.socketId).emit("video_reveal");
  });

  socket.on("skip", () => {
    if (session.state !== "chatting" || !session.roomId) return;
    const rl = checkSkipCooldown(session, config.skipCooldownMs);
    if (!rl.ok) {
      socket.emit("rate_limited", {
        code: "SKIP_COOLDOWN",
        message: "Too many skips.",
        retryAfter: rl.retryAfter,
      });
      return;
    }
    closeRoom(io, session, "skipped");
    socket.emit("skip_complete");
    inc("skips");
  });

  socket.on("report", ({ reason, frame } = {}) => {
    if (session.state !== "chatting" || !session.roomId) return;
    const room = getRoom(session.roomId);
    if (!room) return;
    const partner = getPartner(room, session.id);
    if (!partner) return;
    const partnerSession = S(partner.sessionId);
    if (!partnerSession || isBot(partnerSession)) return;

    if (
      frame !== undefined &&
      (typeof frame !== "string" ||
        frame.length > MAX_REPORT_FRAME_BYTES ||
        !frame.startsWith("data:image/"))
    ) {
      frame = undefined;
    }

    const result = addReport({
      reporterHash: session.ipHash,
      reportedHash: partnerSession.ipHash,
      reason: String(reason || "other").slice(0, 32),
      snapshot: room.messages.slice(-20),
      frame,
    });

    if (result.banned) {
      io.to(partnerSession.socketId).emit("banned", {
        code: "BANNED",
        message: "You have been banned.",
      });
      closeRoom(io, partnerSession, "disconnected");
      inc("bans");
    }

    inc("reports");
  });

  socket.on("webrtc_offer", ({ sdp } = {}) =>
    relayRTC(io, session, "webrtc_offer", { sdp })
  );
  socket.on("webrtc_answer", ({ sdp } = {}) =>
    relayRTC(io, session, "webrtc_answer", { sdp })
  );
  socket.on("webrtc_ice", ({ candidate } = {}) =>
    relayRTC(io, session, "webrtc_ice", { candidate })
  );

  socket.on("disconnect", () => {
    clearHoldTimer(session.id);
    removeFromQueue(session.id);
    if (session.state === "chatting" && session.roomId) {
      closeRoom(io, session, "disconnected");
    }
  });
}

function finalizeHumanMatch(io, match) {
  const { room, a, b } = match;
  io.to(a.session.socketId).emit("matched", {
    roomId: room.id,
    partnerType: b.session.type,
    role: a.role,
    mode: room.mode,
  });
  io.to(b.session.socketId).emit("matched", {
    roomId: room.id,
    partnerType: a.session.type,
    role: b.role,
    mode: room.mode,
  });
  inc("matchesHuman");
}

function finalizeBotMatch(io, room, a, b) {
  io.to(a.session.socketId).emit("matched", {
    roomId: room.id,
    partnerType: "bot",
    role: a.role,
    mode: room.mode,
  });

  startBot({
    sessionId: b.session.id,
    emit: (text) => {
      io.to(a.session.socketId).emit("message", { text, ts: Date.now() });
    },
    onExit: (reason, exitLine) => {
      if (exitLine) {
        io.to(a.session.socketId).emit("message", { text: exitLine, ts: Date.now() });
      }
      const human = getSession(a.session.id);
      if (human) {
        human.state = "idle";
        human.roomId = null;
        io.to(human.socketId).emit("partner_left", { reason });
      }
      destroyBot(b.session.id);
      deleteRoom(room.id);
    },
  });

  inc("matchesBot");
}

export function closeRoom(io, leaverSession, reason) {
  const roomId = leaverSession.roomId;
  if (!roomId) {
    leaverSession.roomId = null;
    leaverSession.state = "idle";
    return;
  }
  const room = getRoom(roomId);
  if (!room) {
    leaverSession.roomId = null;
    leaverSession.state = "idle";
    return;
  }

  const partner = getPartner(room, leaverSession.id);
  const partnerSession = partner ? getSession(partner.sessionId) : null;

  if (partnerSession) {
    partnerSession.roomId = null;
    partnerSession.state = "idle";
    if (isBot(partnerSession)) {
      destroyBot(partnerSession.id);
    } else {
      io.to(partnerSession.socketId).emit("partner_left", { reason });
    }
  }

  leaverSession.roomId = null;
  leaverSession.state = "idle";
  deleteRoom(roomId);
}
