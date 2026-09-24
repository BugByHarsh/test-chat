import { useChat } from "../store/chatStore";

export default function PermissionPrompt({ onRetry, onSkipCall }) {
  const { mediaError, mode } = useChat();

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/95 p-6">
      <div className="max-w-sm w-full bg-white border border-slate-200 rounded-xl p-6 space-y-4 text-center shadow-lg">
        <div className="w-14 h-14 mx-auto rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl">
          {mode === "voice" ? "🎙️" : "🎥"}
        </div>

        <h3 className="font-semibold text-lg text-slate-900">
          {mode === "voice" ? "Microphone access" : "Camera & microphone"}
        </h3>

        <p className="text-sm text-slate-500">
          {mediaError || "We need access to start the call."}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Try again
          </button>

          <button
            onClick={onSkipCall}
            className="flex-1 py-3 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Use text
          </button>
        </div>
      </div>
    </div>
  );
}