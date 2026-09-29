import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "../store/chatStore";
import SearchingIndicator from "./SearchingIndicator";

export default function VoicePane({ searching = false, searchingNotice = null }) {
  const { remoteStream, micOn, iceState, status } = useChat();
  const remoteAudioRef = useRef(null);
  const audioContextRef = useRef(null);
  const [level, setLevel] = useState(0);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);

  const playRemoteAudio = useCallback(async () => {
    const el = remoteAudioRef.current;
    if (!el || !remoteStream) return false;

    try {
      const ctx = audioContextRef.current;
      if (ctx?.state === "suspended") {
        await ctx.resume();
      }

      await el.play();
      setPlaybackBlocked(false);
      return true;
    } catch (error) {
      if (error?.name === "NotAllowedError") {
        setPlaybackBlocked(true);
      } else {
        console.warn("[Voice] Remote audio playback failed", error);
      }
      return false;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!remoteAudioRef.current || !remoteStream) return;

    remoteAudioRef.current.srcObject = remoteStream;
    void playRemoteAudio();
  }, [remoteStream, playRemoteAudio]);

  useEffect(() => {
    if (!remoteStream) return;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

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
      try {
        ctx.close();
      } catch {}
      if (audioContextRef.current === ctx) {
        audioContextRef.current = null;
      }
    };
  }, [remoteStream]);

  useEffect(() => {
    if (!remoteStream) {
      setPlaybackBlocked(false);
      setLevel(0);
    }
  }, [remoteStream]);

  const speaking = level > 0.08;

  return (
    <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center gap-8 p-6 bg-slate-950 overflow-hidden">
      <audio ref={remoteAudioRef} autoPlay playsInline data-remote="true" />

      {searching && searchingNotice && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center bg-slate-950/95">
          <p className="text-sm font-semibold text-red-400">
            {searchingNotice}
          </p>
        </div>
      )}

      {searching && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center">
          <SearchingIndicator />
        </div>
      )}

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

      <div className="relative text-center space-y-2">
        <p className="text-sm text-slate-300">
          {remoteStream
            ? speaking
              ? "Stranger is speaking…"
              : "Stranger"
            : "Connecting audio…"}
        </p>

        {playbackBlocked && remoteStream && (
          <button
            type="button"
            onClick={() => void playRemoteAudio()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800"
          >
            🔊 Tap to enable audio
          </button>
        )}

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
