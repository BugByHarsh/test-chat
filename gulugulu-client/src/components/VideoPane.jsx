import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "../store/chatStore";
import { socket } from "../lib/socket";

export default function VideoPane() {
  const {
    localStream,
    remoteStream,
    revealLocal,
    revealRemote,
    revealRemoteRequested,
    setRevealLocal,
    requestRevealRemote,
    camOn,
    iceState,
    status,
  } = useChat();

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);

  const playRemoteVideo = useCallback(async () => {
    const el = remoteRef.current;
    if (!el || !remoteStream) return false;

    try {
      await el.play();
      setPlaybackBlocked(false);
      return true;
    } catch (error) {
      if (error?.name === "NotAllowedError") {
        setPlaybackBlocked(true);
      } else {
        console.warn("[Video] Remote video playback failed", error);
      }
      return false;
    }
  }, [remoteStream]);

  const attach = useCallback((el, stream, { muted = false } = {}) => {
    if (!el || !stream) return;

    el.muted = muted;

    if (el.srcObject !== stream) {
      el.srcObject = stream;
    }

    void el.play().catch((error) => {
      if (!muted && error?.name === "NotAllowedError") {
        setPlaybackBlocked(true);
      } else if (!muted) {
        console.warn("[Video] Video playback failed", error);
      }
    });
  }, []);

  useEffect(() => {
    attach(localRef.current, localStream, { muted: true });
  }, [localStream, attach]);

  useEffect(() => {
    attach(remoteRef.current, remoteStream);
    setRemoteReady(!!remoteStream);

    if (!remoteStream) {
      setPlaybackBlocked(false);
    }
  }, [remoteStream, attach]);

  const showRemoteVideo = revealRemote && remoteReady;
  const showLocalPreview = revealLocal || !remoteReady;

  const connection = {
    new: { label: "Preparing video…", tone: "slate" },
    checking: { label: "Connecting…", tone: "blue" },
    connected: { label: "Connected", tone: "emerald" },
    completed: { label: "Connected", tone: "emerald" },
    disconnected: { label: "Reconnecting…", tone: "amber" },
    failed: { label: "Connection failed", tone: "red" },
    closed: { label: "Call ended", tone: "slate" },
  }[iceState] || { label: "Connecting…", tone: "blue" };

  const connectionTone = {
    slate: "bg-slate-900/80 text-slate-300 border-slate-700",
    blue: "bg-blue-950/80 text-blue-200 border-blue-800",
    emerald: "bg-emerald-950/80 text-emerald-200 border-emerald-800",
    amber: "bg-amber-950/80 text-amber-200 border-amber-800",
    red: "bg-red-950/80 text-red-200 border-red-800",
  }[connection.tone];

  return (
    <div className="relative flex-none h-[40%] min-h-[220px] max-h-[420px] bg-slate-950 overflow-hidden border-b border-slate-800">
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        data-remote="true"
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          showRemoteVideo ? "opacity-100" : "opacity-0"
        }`}
      />

      {!showRemoteVideo && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-slate-950">
          {!remoteReady ? (
            <div className="space-y-3">
              <div className="flex justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>

              <div className="space-y-1">
                <p className="text-sm text-slate-300">{connection.label}</p>
                <p className="text-[11px] text-slate-500">
                  {remoteReady ? "Video stream received" : "Waiting for stranger's camera…"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-xs">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                👤
              </div>

              <p className="text-sm text-slate-300">
                {revealRemoteRequested
                  ? "Reveal requested. Waiting for stranger…"
                  : "Stranger's video is hidden."}
              </p>

              {!revealRemoteRequested && (
                <button
                  onClick={() => {
                    setRevealLocal(true);
                    requestRevealRemote();
                    socket.emit("video_reveal");
                  }}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  Reveal & show mine
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {showRemoteVideo && playbackBlocked && (
        <div className="absolute inset-x-0 bottom-12 flex justify-center px-4">
          <button
            type="button"
            onClick={() => void playRemoteVideo()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-lg hover:bg-blue-700 active:bg-blue-800"
          >
            ▶ Tap to play video
          </button>
        </div>
      )}

      {status === "chatting" && (
        <div className="absolute top-3 right-3 w-28 sm:w-36 aspect-[3/4] rounded-lg overflow-hidden border border-white/20 bg-slate-900 shadow-lg">
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              showLocalPreview && camOn ? "opacity-100" : "opacity-0"
            }`}
          />

          {(!showLocalPreview || !camOn) && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 bg-slate-900">
              {!camOn ? "cam off" : "hidden"}
            </div>
          )}
        </div>
      )}

      {status === "chatting" && (
        <div className={`absolute bottom-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium ${connectionTone}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            connection.tone === "emerald"
              ? "bg-emerald-400"
              : connection.tone === "red"
                ? "bg-red-400"
                : connection.tone === "amber"
                  ? "bg-amber-400 animate-pulse"
                  : connection.tone === "blue"
                    ? "bg-blue-400 animate-pulse"
                    : "bg-slate-400"
          }`} />
          {connection.label}
        </div>
      )}
    </div>
  );
}
