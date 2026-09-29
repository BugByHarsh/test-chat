import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "../store/chatStore";
import SearchingIndicator from "./SearchingIndicator";

export default function VideoPane({ searching = false, searchingNotice = null }) {
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

  const connectionLabel = {
    new: "Preparing video…",
    checking: "Connecting…",
    connected: "Connected",
    completed: "Connected",
    disconnected: "Reconnecting…",
    failed: "Connection failed",
    closed: "Call ended",
  }[iceState] || "Connecting…";


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

  return (
    <div className="relative flex-none h-[50%] min-h-[240px] max-h-[520px] bg-slate-950 overflow-hidden border-b border-slate-800">
      {searching && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 px-6 text-center bg-slate-950">
          {searchingNotice && (
            <p className="text-sm font-semibold text-red-400">
              {searchingNotice}
            </p>
          )}
          <SearchingIndicator />
        </div>
      )}

      <video
        ref={remoteRef}
        autoPlay
        playsInline
        data-remote="true"
        className={`absolute left-1/2 top-0 h-full w-auto max-w-full -translate-x-1/2 object-contain transition-opacity duration-200 ${
          showRemoteVideo ? "opacity-100" : "opacity-0"
        }`}
      />

      {!searching && !showRemoteVideo && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-slate-950">
          {!remoteReady ? (
            <div className="space-y-3">
              <div className="flex justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>

              <div className="space-y-1">
                <p className="text-sm text-slate-300">{connectionLabel}</p>
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
        <div className="absolute top-3 right-3 w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden border border-white/20 bg-slate-900 shadow-lg">
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
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 bg-slate-900">
              cam off
            </div>
          )}
        </div>
      )}

      {status === "chatting" && (
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-950/85 px-1.5 py-1 shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={toggleMic}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
            title={micOn ? "Mute microphone" : "Unmute microphone"}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
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
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
              camOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-red-500 text-white"
            }`}
          >
            {camOn ? "📹" : "🚫"}
          </button>
        </div>
      )}

    </div>
  );
}
