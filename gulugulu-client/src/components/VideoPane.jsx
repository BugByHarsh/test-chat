import { useEffect, useRef, useState } from "react";
import { useChat } from "../store/chatStore";
import { socket } from "../lib/socket";

function attach(el, stream) {
  if (!el || !stream) return;
  if (el.srcObject !== stream) {
    el.srcObject = stream;
    el.play().catch(() => {});
  }
}

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

  useEffect(() => {
    attach(localRef.current, localStream);
  }, [localStream]);

  useEffect(() => {
    attach(remoteRef.current, remoteStream);
    setRemoteReady(!!remoteStream);
  }, [remoteStream]);

  const showRemoteVideo = revealRemote && remoteReady;
  const showLocalPreview = revealLocal || !remoteReady;

  return (
    <div className="relative flex-1 min-h-0 bg-slate-950 overflow-hidden">
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        data-remote="true"
        className={`w-full h-full object-cover transition-opacity duration-200 ${showRemoteVideo ? "opacity-100" : "opacity-0"}`}
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

      {status === "chatting" && (
        <div className="absolute top-3 right-3 w-28 sm:w-36 aspect-[3/4] rounded-lg overflow-hidden border border-white/20 bg-slate-900 shadow-lg">
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-200 ${showLocalPreview && camOn ? "opacity-100" : "opacity-0"}`}
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