import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "../store/chatStore";

export default function VideoPane() {
  const {
    localStream,
    remoteStream,
    camOn,
    micOn,
    iceState,
    status,
    setCamOn,
    setMicOn,
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

  const showRemoteVideo = remoteReady;

  const toggleMic = () => {
    if (!localStream) return;
    const next = !micOn;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setMicOn(next);
  };

  const toggleCamera = () => {
    if (!localStream) return;
    const next = !camOn;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setCamOn(next);
  };

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
        className={`absolute left-1/2 top-0 h-full w-auto max-w-full -translate-x-1/2 object-contain transition-opacity duration-200 ${
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
            <div className="space-y-2 max-w-xs">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">
                👤
              </div>
              <p className="text-sm text-slate-300">Waiting for stranger's camera…</p>
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
        <div className="absolute top-3 right-3 w-24 sm:w-28 aspect-[3/4] rounded-lg overflow-hidden border border-white/20 bg-slate-900 shadow-lg">
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-contain transition-opacity duration-200 ${
              camOn ? "opacity-100" : "opacity-0"
            }`}
          />

          {!camOn && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 bg-slate-900">
              cam off
            </div>
          )}
        </div>
      )}

      {status === "chatting" && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/85 px-2 py-1.5 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={toggleMic}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
            title={micOn ? "Mute microphone" : "Unmute microphone"}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-base transition-colors ${
              micOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white"
            }`}
          >
            {micOn ? "🎙️" : "🔇"}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            aria-label={camOn ? "Turn camera off" : "Turn camera on"}
            title={camOn ? "Turn camera off" : "Turn camera on"}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-base transition-colors ${
              camOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white"
            }`}
          >
            {camOn ? "📹" : "🚫"}
          </button>
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
