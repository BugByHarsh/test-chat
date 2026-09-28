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

  return (
    <div className="relative flex-1 min-h-0 bg-slate-950 overflow-hidden">
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

              <p className="text-sm text-slate-300">
                {iceState === "checking"
                  ? "Connecting video…"
                  : "Waiting for video…"}
              </p>
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
        <div className="absolute bottom-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-slate-300">
          {iceState}
        </div>
      )}
    </div>
  );
}
