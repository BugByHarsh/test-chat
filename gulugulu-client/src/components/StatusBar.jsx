import { useChat } from "../store/chatStore";
import { Link } from "react-router-dom";

export default function StatusBar() {
  const { status, onlineCount, connected, mode, partnerTyping } = useChat();

  return (
    <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-slate-200 bg-white z-20">
      <div className="flex items-center gap-2 min-w-0">
        <Link to="/" className="flex items-center gap-1.5 group">
          <span className="text-lg leading-none transition-transform group-hover:-rotate-6">🦆</span>
          <span className="hidden sm:inline text-sm font-bold tracking-tight text-slate-900">
            Gulugulu
          </span>
        </Link>

        <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-400"}`} />

        <span className="text-xs text-slate-400 whitespace-nowrap">
          {onlineCount} online
        </span>

        {status === "chatting" && mode !== "text" && partnerTyping && (
          <span className="text-[10px] text-slate-400 italic">typing…</span>
        )}
      </div>

      <StatusPill status={status} />
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    idle: { label: "Ready", color: "text-slate-500 bg-slate-100" },
    searching: { label: "Searching", color: "text-blue-600 bg-blue-50" },
    chatting: { label: "Connected", color: "text-emerald-600 bg-emerald-50" },
    ended: { label: "Ended", color: "text-slate-500 bg-slate-100" },
  };

  const m = map[status] || map.idle;

  const dot =
    status === "searching"
      ? "bg-blue-500 animate-pulse"
      : status === "chatting"
        ? "bg-emerald-500"
        : "bg-slate-400";

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {m.label}
    </span>
  );
}