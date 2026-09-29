import { useEffect, useCallback, useRef } from "react";
import { socket } from "../lib/socket";
import { useChat } from "../store/chatStore";
import { sounds } from "../lib/sounds";

const CONSENT_KEY = "gulugulu_age_confirmed";
const CONSENT_TTL_MS = 24 * 60 * 60 * 1000;

function hasValidConsent() {
  const raw = localStorage.getItem(CONSENT_KEY);
  if (!raw) return false;

  // Migrate the old permanent flag into the new 24-hour format.
  if (raw === "1") {
    localStorage.setItem(CONSENT_KEY, String(Date.now()));
    return true;
  }

  const acceptedAt = Number(raw);
  if (!Number.isFinite(acceptedAt) || Date.now() - acceptedAt >= CONSENT_TTL_MS) {
    localStorage.removeItem(CONSENT_KEY);
    return false;
  }

  return true;
}

export function useSocket() {
  const startedRef = useRef(false);
  const activeSearchIdRef = useRef(null);

  useEffect(() => {
    if (!startedRef.current) {
      socket.connect();
      startedRef.current = true;
    }

    const S = useChat.getState;

    S().updateWebRTCDebug({ lastEvent: "socket: starting", updatedAt: Date.now() });

    const onConnect = () => {
      S().setConnected(true);
      S().updateWebRTCDebug({ lastEvent: `socket: connected (${socket.id || "no id"})`, lastError: "" });
      if (hasValidConsent()) {
        socket.emit("confirm_age");
      }
    };

    const onDisconnect = (reason) => {
      const state = S();
      activeSearchIdRef.current = null;

      state.setConnected(false);
      state.updateWebRTCDebug({
        lastEvent: `socket: disconnected (${reason})`,
        lastError: reason,
      });

      // A socket disconnect ends the current session. Do not leave the UI
      // looking like the user is still chatting/calling while the server has
      // already closed the room.
      if (state.status === "chatting" || state.status === "searching") {
        const stream = state.localStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        state.resetRoom();
        state.setLocalStream(null);
        state.setMediaError(null);
      }

      if (reason !== "io client disconnect") {
        state.pushSystem("Connection lost. Session ended.");
      }
    };

    const onWaiting = (p = {}) => {
      if (!p.searchId || p.searchId !== activeSearchIdRef.current) return;
      if (S().status !== "searching") return;
      S().setStatus("searching");
    };

    const onMatched = (p = {}) => {
      if (!p.searchId || p.searchId !== activeSearchIdRef.current) return;
      if (S().status !== "searching") return;
      S().setMatched(p);
      sounds.match();
      S().pushSystem("You're now chatting with a stranger.");
    };

    const onMessage = (p = {}) => {
      const state = S();
      if (state.status !== "chatting" || !state.roomId || p.roomId !== state.roomId) return;
      S().pushMessage({
        id: Math.random().toString(36).slice(2),
        from: "partner",
        text: p.text,
        ts: p.ts,
      });
    };

    const onTyping = (p = {}) => {
      const state = S();
      if (state.status !== "chatting" || p.roomId !== state.roomId) return;
      state.setPartnerTyping(p.isTyping);
    };

    const onVideoReveal = (p = {}) => {
      const state = S();
      if (state.status !== "chatting" || p.roomId !== state.roomId) return;
      state.setRevealRemote(true);
    };
    const onSkipComplete = (p = {}) => {
      if (!p.searchId || p.searchId !== activeSearchIdRef.current) return;
      window.dispatchEvent(new CustomEvent("gulugulu:skip-complete", { detail: p }));
    };

    const onLeft = (p) => {
      const labels = {
        skipped: "Stranger skipped.",
        disconnected: "Stranger disconnected.",
        timeout: "Stranger left.",
        exited: "Stranger left.",
      };
      const state = S();
      if (state.status !== "chatting" || !state.roomId || p.roomId !== state.roomId) return;
      state.showToast(labels[p.reason] || "Stranger left.", "info");

      // Partner leaving ends our current session too. Stop call media here;
      // Skip initiated by us intentionally keeps media alive for rematching.
      const stream = state.localStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      state.resetRoom();
      state.setLocalStream(null);
      state.setMediaError(null);
      state.setMicOn(true);
      state.setCamOn(true);
    };

    const randomOnlineCount = () => Math.floor(3000 + Math.random() * 2001);
    const onOnline = () => S().setOnlineCount(randomOnlineCount());

    S().setOnlineCount(randomOnlineCount());
    const onlineCountTimer = setInterval(() => {
      S().setOnlineCount(randomOnlineCount());
    }, 30000);

    const onErr = (p) => {
      S().showToast(p.message, "error");
      if (S().status === "searching") S().setStatus("idle");
    };

    const onRateLimited = (p) => {
      const msg = p.retryAfter
        ? `${p.message} (retry in ${Math.ceil(p.retryAfter / 1000)}s)`
        : p.message;
      S().showToast(msg, "error");
    };

    const onBanned = (p) => {
      S().showToast(p.message, "error");
      S().resetAll();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("waiting", onWaiting);
    socket.on("matched", onMatched);
    socket.on("message", onMessage);
    socket.on("partner_typing", onTyping);
    socket.on("video_reveal", onVideoReveal);
    socket.on("skip_complete", onSkipComplete);
    socket.on("partner_left", onLeft);
    socket.on("online_count", onOnline);
    socket.on("error", onErr);
    socket.on("rate_limited", onRateLimited);
    socket.on("banned", onBanned);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("waiting", onWaiting);
      socket.off("matched", onMatched);
      socket.off("message", onMessage);
      socket.off("partner_typing", onTyping);
      socket.off("video_reveal", onVideoReveal);
      socket.off("skip_complete", onSkipComplete);
      socket.off("partner_left", onLeft);
      socket.off("online_count", onOnline);
      clearInterval(onlineCountTimer);
      socket.off("error", onErr);
      socket.off("rate_limited", onRateLimited);
      socket.off("banned", onBanned);
    };
  }, []);

  return {
    findPartner: useCallback((mode, interests) => {
      const searchId = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
      activeSearchIdRef.current = searchId;
      socket.emit("find_partner", { mode, interests, searchId });
    }, []),
    cancelSearch: useCallback(() => socket.emit("cancel_search"), []),
    leaveSession: useCallback(() => {
      activeSearchIdRef.current = null;
      if (socket.connected) {
        socket.emit("leave_session");
      }
    }, []),
    sendMessage: useCallback((text) => socket.emit("message", { text }), []),
    sendTyping: useCallback((isTyping) => socket.emit("typing", { isTyping }), []),
    skip: useCallback((source = "user") => socket.emit("skip", { source }), []),
    report: useCallback((reason, frame) => {
      socket.emit("report", { reason, frame });
    }, []),
  };
}