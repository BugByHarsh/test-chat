import { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useWebRTC } from "../hooks/useWebRTC";
import { useMedia } from "../hooks/useMedia";
import { useHotkeys } from "../hooks/useHotkeys";
import { useReconnect } from "../hooks/useReconnect";
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

export default function Chat() {
  const {
    status,
    mode,
    interests,
    pushMessage,
    openReport,
    mediaPermission,
  } = useChat();

  const socketApi = useSocket();
  const media = useMedia();
  const webrtc = useWebRTC();
  const skipTimerRef = useRef(null);

  const [confirmSkip, setConfirmSkip] = useState(false);

  useReconnect();

  useEffect(() => {
    document.title = "Gulugulu";
  }, []);

  const beginSearch = async () => {
    const S = useChat.getState();
    const currentInterests = S.interests;

    S.startSearching();

    if (mode === "text") {
      socketApi.findPartner("text", currentInterests);
      return;
    }

    if (!media.getStream()) {
      const stream = await media.request({
        audio: true,
        video: mode === "video",
      });

      if (!stream) {
        S.setStatus("idle");
        return;
      }
    }

    await webrtc.start();
    socketApi.findPartner(mode, currentInterests);
  };

  const performSkip = () => {
    clearTimeout(skipTimerRef.current);
    setConfirmSkip(false);

    if (mode !== "text") {
      webrtc.teardown();
    }

    socketApi.skip();
  };

  useEffect(() => {
    const handleSkipComplete = () => beginSearch();
    window.addEventListener("gulugulu:skip-complete", handleSkipComplete);
    return () => window.removeEventListener("gulugulu:skip-complete", handleSkipComplete);
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

    socketApi.sendMessage(text);
  };

  const doReport = (reason, frame) => {
    socketApi.report(reason, frame);
    useChat.getState().showToast("Report sent. Thanks.", "success");
  };

  useHotkeys(
    {
      escape: () => {
        if (status === "chatting") {
          onSkip();
        }
      },
    },
    [status, mode, interests, confirmSkip]
  );

  useEffect(() => {
    return () => {
      clearTimeout(skipTimerRef.current);
      media.stop();
      webrtc.teardown();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isChatting = status === "chatting";
  const isSearching = status === "searching";
  const isIdle = status === "idle";
  const isCallMode = mode === "voice" || mode === "video";

  const showPermissionPrompt =
    isCallMode &&
    isIdle &&
    (mediaPermission === "denied" ||
      mediaPermission === "unavailable");

  return (
    <div className="h-full flex flex-col bg-white text-slate-800 relative overflow-hidden">
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

        {isCallMode && (isChatting || isSearching) ? (
          mode === "video" ? (
            <VideoPane />
          ) : (
            <VoicePane />
          )
        ) : isChatting ? (
          <MessageList />
        ) : isSearching ? (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <SearchingIndicator />
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4">
            <IdleHint />

            <div className="w-full max-w-lg mt-7">
              <InterestInput />
            </div>
          </div>
        )}

        {showPermissionPrompt && (
          <PermissionPrompt
            onRetry={beginSearch}
            onSkipCall={() => {
              useChat.getState().setMode("text");
              media.stop();

              setTimeout(() => beginSearch(), 0);
            }}
          />
        )}
      </div>

      <div
        className="border-t border-slate-200 bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="w-full px-3 pt-3 pb-3">
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
                onTyping={socketApi.sendTyping}
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