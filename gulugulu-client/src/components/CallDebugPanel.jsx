import { useState } from "react";
import { socket } from "../lib/socket";
import { useChat } from "../store/chatStore";

export default function CallDebugPanel() {
  const [open, setOpen] = useState(false);
  const {
    status,
    mode,
    role,
    mediaPermission,
    mediaError,
    localStream,
    remoteStream,
    webrtcDebug,
  } = useChat();

  const rows = [
    ["socket", socket.connected ? "connected" : "disconnected"],
    ["socket id", socket.id || "—"],
    ["status / mode", `${status} / ${mode}`],
    ["role", role || "—"],
    ["media", mediaPermission],
    ["local stream", localStream ? "yes" : "no"],
    ["remote stream", remoteStream ? "yes" : "no"],
    ["PC", webrtcDebug.pcState],
    ["connection", webrtcDebug.connectionState],
    ["ICE", webrtcDebug.iceState],
    ["signaling", webrtcDebug.signalingState],
    ["local tracks", webrtcDebug.localTracks.join(", ") || "—"],
    ["remote tracks", webrtcDebug.remoteTracks.join(", ") || "—"],
    ["offers", `${webrtcDebug.offersSent} sent / ${webrtcDebug.offersReceived} recv`],
    ["answers", `${webrtcDebug.answersSent} sent / ${webrtcDebug.answersReceived} recv`],
    ["ICE candidates", `${webrtcDebug.iceSent} sent / ${webrtcDebug.iceReceived} recv`],
    ["ICE errors", String(webrtcDebug.iceErrors)],
    ["last event", webrtcDebug.lastEvent || "—"],
  ];

  return (
    <div className="fixed right-3 bottom-3 z-[60] w-[min(92vw,380px)] text-[10px] font-mono">
      <div className="flex flex-col items-end">
        {open && (
          <div className="mb-2 max-h-[60vh] w-full overflow-auto rounded-lg border border-amber-400/40 bg-slate-950/95 p-3 text-slate-200 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <strong className="text-amber-300">TEMP WebRTC diagnostics</strong>
              <span className="text-slate-500">remove after debugging</span>
            </div>

            <div className="space-y-1">
              {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[105px_1fr] gap-2">
                  <span className="text-slate-500">{label}</span>
                  <span className={label === "ICE errors" && value !== "0" ? "text-red-300" : "text-slate-200"}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {mediaError && (
              <div className="mt-3 rounded border border-red-800 bg-red-950/50 p-2 text-red-300">
                media error: {mediaError}
              </div>
            )}

            {webrtcDebug.lastError && (
              <div className="mt-2 rounded border border-red-800 bg-red-950/50 p-2 text-red-300">
                last error: {webrtcDebug.lastError}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-amber-400/60 bg-slate-950/95 px-3 py-2 text-amber-300 shadow-lg"
        >
          🛠 {open ? "Hide call debug" : "Call debug"}
          <span className="ml-2 text-slate-400">{webrtcDebug.lastEvent}</span>
        </button>
      </div>
    </div>
  );
}
