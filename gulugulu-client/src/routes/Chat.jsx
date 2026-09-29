import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { useMedia } from "../hooks/useMedia";
import { useChat } from "../store/chatStore";
import MessageList from "../components/MessageList";
import Composer from "../components/Composer";
import StatusBar from "../components/StatusBar";
import SearchingIndicator from "../components/SearchingIndicator";
import VideoPane from "../components/VideoPane";
import VoicePane from "../components/VoicePane";
import ReportModal from "../components/ReportModal";
import ConnectionBanner from "../components/ConnectionBanner";
import PermissionPrompt from "../components/PermissionPrompt";
import InterestInput from "../components/InterestInput";

const CONSENT_KEY = "gulugulu_age_confirmed";
const CONSENT_TTL_MS = 24 * 60 * 60 * 1000;

function hasValidConsent() {
  const raw = localStorage.getItem(CONSENT_KEY);
  if (!raw) return false;
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
import CallDebugPanel from "../components/CallDebugPanel";

export default function Chat() {
  const {
    status,
    mode,
    interests,
    pushMessage,
    openReport,
    mediaPermission,
  } = useChat();

  const {
    findPartner,
    sendMessage,
    sendTyping,
    skip: skipSession,
    report,
    leaveSession,
  } = useSocket();
  const { request: requestMedia, stop: stopMedia, getStream } = useMedia();
  const { teardown: teardownWebRTC } = useWebRTC();
  const skipTimerRef = useRef(null);
  const leavingRef = useRef(false);
  const skipPendingRef = useRef(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [confirmSkip, setConfirmSkip] = useState(false);

  const leaveCurrentSession = useCallback(() => {
    if (leavingRef.current) return;

    const state = useChat.getState();
    if (state.status !== "chatting" && state.status !== "searching") return;

    leavingRef.current = true;
    clearTimeout(skipTimerRef.current);
    setConfirmSkip(false);

    // End the server-side session first while the socket is still alive.
    leaveSession();
    skipPendingRef.current = false;

    // Back/refresh/navigation is a real session end. Teardown is safe for
    // text mode too and prevents stale call state if the mode changed.
    teardownWebRTC();
    stopMedia();

    state.resetRoom();
    state.setMediaError(null);
    state.setMicOn(true);
    state.setCamOn(true);
  }, [leaveSession, mode, stopMedia, teardownWebRTC]);


  useEffect(() => {
    if (!hasValidConsent()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    const nextMode = ["text", "voice", "video"].includes(requestedMode)
      ? requestedMode
      : "text";
    useChat.getState().setMode(nextMode);
  }, [searchParams]);

  useEffect(() => {
    const handleBack = () => {
      leaveCurrentSession();
    };

    const handlePageExit = () => {
      leaveCurrentSession();
    };

    window.addEventListener("popstate", handleBack);
    window.addEventListener("pagehide", handlePageExit);
    window.addEventListener("beforeunload", handlePageExit);

    return () => {
      window.removeEventListener("popstate", handleBack);
      window.removeEventListener("pagehide", handlePageExit);
      window.removeEventListener("beforeunload", handlePageExit);
    };
  }, [leaveCurrentSession]);

  useEffect(() => {
    document.title = "Gulugulu";
  }, []);

  const beginSearch = async (requestedMode = useChat.getState().mode, notice = null) => {
    leavingRef.current = false;
    const S = useChat.getState();
    const currentInterests = S.interests;

    S.startSearching();
    S.setSearchNotice(notice);

    if (requestedMode === "text") {
      findPartner("text", currentInterests);
      return;
    }

    const requiredMedia = { audio: true, video: requestedMode === "video" };
    if (!getStream(requiredMedia)) {
      const stream = await requestMedia({
        audio: true,
        video: requestedMode === "video",
      });

      if (!stream) {
        S.setStatus("idle");
        return;
      }
    }

    // WebRTC must start only after matchmaking assigns a room and role.
    // Creating it while searching causes the WebRTC hook to tear it down
    // immediately because there is no active chat room yet.
    findPartner(requestedMode, currentInterests);
  };

  const performSkip = () => {
    clearTimeout(skipTimerRef.current);
    setConfirmSkip(false);

    if (mode !== "text") {
      teardownWebRTC();
    }

    skipPendingRef.current = true;
    skipSession("user");
  };

  useEffect(() => {
    const handleSkipComplete = (event) => {
      const source = event.detail?.source || "user";
      if (leavingRef.current) return;
      if (source === "connection_failure") {
        if (useChat.getState().status !== "chatting") return;
        beginSearch(useChat.getState().mode);
        return;
      }
      if (!skipPendingRef.current) return;

      // The server has already closed the room for the skipper. Synchronize
      // local state immediately so the UI shows New instead of stale chat UI.
      skipPendingRef.current = false;
      const state = useChat.getState();
      state.resetRoom();

      // Keep the live local media stream when the user who pressed Skip
      // returns to idle. useMedia owns the same stream in its ref, and New
      // should reuse it instead of leaving Zustand null while the media ref
      // still points at a live stream. Otherwise the next search can skip
      // getUserMedia(), then create the new PeerConnection with no tracks.
      state.setMediaError(null);
      state.setMicOn(true);
      state.setCamOn(true);
    };

    const handlePartnerSkipped = () => {
      if (leavingRef.current) return;
      if (useChat.getState().status !== "idle") return;
      beginSearch(useChat.getState().mode, {
        disconnect: "Stranger has disconnected.",
        next: "Finding someone new...",
      });
    };

    window.addEventListener("gulugulu:skip-complete", handleSkipComplete);
    window.addEventListener("gulugulu:partner-skipped", handlePartnerSkipped);

    return () => {
      window.removeEventListener("gulugulu:skip-complete", handleSkipComplete);
      window.removeEventListener("gulugulu:partner-skipped", handlePartnerSkipped);
    };
  }, [mode]);

  const onSkip = () => {
    if (!confirmSkip) {
      setConfirmSkip(true);

      clearTimeout(skipTimerRef.current);

      skipTimerRef.current = setTimeout(() => {
        setConfirmSkip(false);
      }, 5000);

      return;
    }

    performSkip();
  };

  const onNewClick = () => {
    if (!hasValidConsent()) {
      navigate("/", { replace: true });
      return;
    }

    if (status === "searching") return;

    setConfirmSkip(false);
    clearTimeout(skipTimerRef.current);

    beginSearch();
  };

  const onSend = (text) => {
    pushMessage({
      id: Math.random().toString(36).slice(2),
      from: "me",
      text,
      ts: Date.now(),
    });

    sendMessage(text);
  };

  const doReport = (reason, frame) => {
    report(reason, frame);
    useChat.getState().showToast("Report sent. Thanks.", "success");
  };

  useEffect(() => {
    return () => {
      clearTimeout(skipTimerRef.current);

      // Route unmounts (including browser Back) must end the server-side
      // session too. Otherwise the socket survives the route change and the
      // server can keep this client in the matchmaking queue.
      const state = useChat.getState();
      if (state.status === "chatting" || state.status === "searching") {
        leaveSession();
        state.resetRoom();
        state.setMediaError(null);
        state.setMicOn(true);
        state.setCamOn(true);
      }

      stopMedia();
      teardownWebRTC();
    };
  }, [leaveSession, stopMedia, teardownWebRTC]);

  const isChatting = status === "chatting";
  const isSearching = status === "searching";
  const isIdle = status === "idle";
  const isCallMode = mode === "voice" || mode === "video";

  const showPermissionPrompt =
    isCallMode &&
    isIdle &&
    (mediaPermission === "denied" ||
      mediaPermission === "unavailable");

  const renderConversation = () => {
    if (isChatting) {
      if (mode === "video") {
        return (
          <div className="flex-1 min-h-0 flex flex-col">
            <VideoPane />
            <MessageList />
          </div>
        );
      }

      if (mode === "voice") {
        return (
          <div className="flex-1 min-h-0 flex flex-col">
            <VoicePane />
            <MessageList />
          </div>
        );
      }

      return <MessageList />;
    }

    if (isSearching) {
      return (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4 px-4">
          {searchNotice && (
            <div className="w-full max-w-sm text-center space-y-2">
              <div className="text-sm font-semibold text-red-700">
                {searchNotice.disconnect}
              </div>
              <div className="text-sm text-slate-500">
                {searchNotice.next}
              </div>
            </div>
          )}
          <SearchingIndicator />
        </div>
      );
    }

    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4">
        <IdleHint />

        <div className="w-full max-w-lg mt-7">
          <InterestInput />
        </div>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] min-h-0 flex flex-col bg-white text-slate-800 relative overflow-hidden overscroll-none">
      <ConnectionBanner />

      <StatusBar />

      <div className="flex-1 min-h-0 relative flex flex-col">
        <button
          onClick={openReport}
          disabled={!isChatting}
          aria-label="Report"
          className={`absolute top-3 right-4 z-10 w-8 h-8 rounded-full text-sm font-bold transition-colors ${
            isChatting
              ? "bg-white border border-red-500 text-red-500 hover:bg-red-50 active:bg-red-100"
              : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          !
        </button>

        {renderConversation()}

        {showPermissionPrompt && (
          <PermissionPrompt
            onRetry={beginSearch}
            onSkipCall={() => {
              useChat.getState().setMode("text");
              stopMedia();

              setTimeout(() => beginSearch("text"), 0);
            }}
          />
        )}
      </div>

      <div
        className="shrink-0 border-t border-slate-200 bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="w-full px-3 pt-2 pb-2 sm:pt-3 sm:pb-3">
          <div className="flex gap-2">
            {isChatting ? (
              <button
                onClick={onSkip}
                className={`w-28 shrink-0 rounded-lg font-medium text-sm transition-colors ${
                  confirmSkip
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {confirmSkip ? "Really?" : "Skip"}
                <span className="block text-[11px] opacity-80">
                  {confirmSkip ? "Click again" : "Esc"}
                </span>
              </button>
            ) : (
              <button
                onClick={onNewClick}
                disabled={isSearching}
                className={`w-28 shrink-0 rounded-lg font-medium text-sm transition-colors ${
                  isSearching
                    ? "bg-slate-100 text-slate-400 cursor-wait"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                New
              </button>
            )}

            <div className="flex-1 min-w-0">
              <Composer
                onSend={onSend}
                onTyping={sendTyping}
                disabled={!isChatting}
                placeholder={
                  isChatting
                    ? "Type a message"
                    : isSearching
                      ? "Looking for someone…"
                      : "Click New to start…"
                }
              />
            </div>
          </div>
        </div>
      </div>

      <ReportModal onReport={doReport} />
      <CallDebugPanel />
    </div>
  );
}

function IdleHint() {
  return (
    <div className="text-center">
      <div className="text-4xl mb-3">🦆</div>

      <p className="text-sm text-slate-600">
        Find someone new
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Add interests to find something in common
      </p>
    </div>
  );
}
