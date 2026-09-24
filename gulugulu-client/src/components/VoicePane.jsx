import { useEffect, useRef, useState } from "react";
import { useChat } from "../store/chatStore";

export default function VoicePane() {
  const { remoteStream, micOn, iceState, status } = useChat();
  const remoteAudioRef = useRef(null);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!remoteStream) return;

    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(remoteStream);
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 512;
    src.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf;

    const tick = () => {
      analyser.getByteFrequencyData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
      }

      setLevel(sum / data.length / 255);
      raf = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      try {
        src.disconnect();
      } catch {}
      ctx.close();
    };
  }, [remoteStream]);

  const speaking = level > 0.08;

  return (
    <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-8 p-6 bg-slate-950 overflow-hidden">
      <audio ref={remoteAudioRef} autoPlay playsInline data-remote="true" />

      <div className="relative">
        {speaking && (
          <>
            <span className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping" />
            <span className="absolute -inset-2 rounded-full border border-emerald-400/20 animate-ping" style={{ animationDelay: "200ms" }} />
          </>
        )}

        <div
          className={`relative w-28 h-28 rounded-full bg-slate-800 border flex items-center justify-center text-4xl transition-all duration-150 ${
            speaking
              ? "border-emerald-400 ring-4 ring-emerald-400/20 scale-105"
              : "border-slate-700"
          }`}
        >
          👤
        </div>
      </div>

      <div className="relative text-center space-y-1">
        <p className="text-sm text-slate-300">
          {remoteStream
            ? speaking
              ? "Stranger is speaking…"
              : "Stranger"
            : "Connecting audio…"}
        </p>

        {status === "chatting" && (
          <p className="text-[10px] text-slate-500">{iceState}</p>
        )}
      </div>

      {status === "chatting" && (
        <div className={`relative px-3 py-1.5 rounded-full text-xs border ${
          micOn
            ? "bg-slate-900 border-slate-700 text-slate-300"
            : "bg-red-950/40 border-red-900/50 text-red-300"
        }`}>
          {micOn ? "🎤 mic on" : "🔇 muted"}
        </div>
      )}
    </div>
  );
}