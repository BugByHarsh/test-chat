import { useChat } from "../store/chatStore";
import { Link } from "react-router-dom";

const MODE_LABELS = { text: "Text", voice: "Voice", video: "Video" };

export default function StatusBar() {
  const { status, onlineCount, connected, mode, partnerTyping } = useChat();

  return (
    <div className="relative z-20 flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 sm:px-5 py-2.5 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <Link to="/" className="flex shrink-0 items-center gap-2 group" aria-label="Gulugulu home">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-lg shadow-sm shadow-blue-200 transition-transform group-hover:-rotate-6">🦆</span>
          <span className="hidden sm:inline text-sm font-bold tracking-tight text-slate-900">Gulugulu</span>
        </Link>

        <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
          <span className={`h-2 w-2 shrink-0 rounded-full ${connected ? "bg-emerald-500" : "bg-red-400"}`} />
          <span className="whitespace-nowrap">{onlineCount.toLocaleString()} online</span>
        </span>
        <span className="hidden sm:inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {MODE_LABELS[mode] || "Text"}
        </span>
        {status === "chatting" && partnerTyping && (
          <span className="hidden sm:inline text-xs italic text-slate-400">Typing…</span>
        )}
      </div>

      <StatusPill status={status} />
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    idle: { label: "Ready", color: "text-slate-600 bg-slate-100" },
    searching: { label: "Searching", color: "text-blue-700 bg-blue-50" },
    chatting: { label: "Connected", color: "text-emerald-700 bg-emerald-50" },
    ended: { label: "Ended", color: "text-slate-600 bg-slate-100" },
  };
  const m = map[status] || map.idle;
  const dot = status === "searching" ? "bg-blue-500 animate-pulse" : status === "chatting" ? "bg-emerald-500" : "bg-slate-400";

  return (
    <span role="status" className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${m.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {m.label}
    </span>
  );
}
