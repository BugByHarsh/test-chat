import { useEffect, useCallback, useRef } from "react";
import { socket } from "../lib/socket";
import { useChat } from "../store/chatStore";
import { sounds } from "../lib/sounds";

export function useSocket() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      socket.connect();
      startedRef.current = true;
    }

    const S = useChat.getState;

    const onConnect = () => S().setConnected(true);

    const onDisconnect = (reason) => {
      S().setConnected(false);
      if (reason !== "io client disconnect") {
        S().pushSystem("Connection lost. Reconnecting…");
      }
    };

    const onWaiting = () => S().setStatus("searching");

    const onMatched = (p) => {
      S().setMatched(p);
      sounds.match();
      S().pushSystem(
        p.partnerType === "bot"
          ? "Matched with a bot (demo)."
          : "You're now chatting with a stranger."
      );
    };

    const onMessage = (p) => {
      S().pushMessage({
        id: Math.random().toString(36).slice(2),
        from: "partner",
        text: p.text,
        ts: p.ts,
      });
      sounds.msg();
    };

    const onTyping = (p) => S().setPartnerTyping(p.isTyping);

    const onVideoReveal = () => S().setRevealRemote(true);

    const onLeft = (p) => {
      const labels = {
        skipped: "Stranger skipped.",
        disconnected: "Stranger disconnected.",
        timeout: "Stranger left.",
        exited: "Stranger left.",
      };
      S().showToast(labels[p.reason] || "Stranger left.", "info");
      S().resetRoom();
    };

    const onOnline = (p) => S().setOnlineCount(p.count);

    const onErr = (p) => {
      S().showToast(p.message, "error");
      sounds.error();
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
      socket.off("partner_left", onLeft);
      socket.off("online_count", onOnline);
      socket.off("error", onErr);
      socket.off("rate_limited", onRateLimited);
      socket.off("banned", onBanned);
    };
  }, []);

  return {
    findPartner: useCallback((mode, interests) => {
      socket.emit("find_partner", { mode, interests });
    }, []),
    cancelSearch: useCallback(() => socket.emit("cancel_search"), []),
    sendMessage: useCallback((text) => socket.emit("message", { text }), []),
    sendTyping: useCallback((isTyping) => socket.emit("typing", { isTyping }), []),
    skip: useCallback(() => socket.emit("skip"), []),
    report: useCallback((reason, frame) => {
      socket.emit("report", { reason, frame });
    }, []),
  };
}