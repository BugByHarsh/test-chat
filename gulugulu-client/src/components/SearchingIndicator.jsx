import { useChat } from "../store/chatStore";

export default function SearchingIndicator() {
  const { connected } = useChat();

  if (!connected) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-500">Connecting…</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-3">
      <div className="flex justify-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>

      <p className="text-sm text-slate-600">
        Looking for someone…
      </p>

      <p className="text-xs text-slate-400">
        You'll be connected automatically.
      </p>
    </div>
  );
}