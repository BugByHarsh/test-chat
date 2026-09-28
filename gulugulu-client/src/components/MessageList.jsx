import { useEffect, useRef, useState } from "react";
import { useChat } from "../store/chatStore";

export default function MessageList() {
  const { messages, partnerTyping } = useChat();
  const ref = useRef(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (locked) return;
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, partnerTyping, locked]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setLocked(!nearBottom);
  };

  return (
    <div ref={ref} onScroll={onScroll} aria-label="Conversation messages" className="h-full overflow-y-auto bg-slate-50/60 px-3 sm:px-5 py-4 space-y-3">
      {messages.length === 0 && (
        <div className="flex h-full min-h-40 items-center justify-center">
          <p className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm">
            You're connected. Say hello to start the conversation.
          </p>
        </div>
      )}

      {messages.map((m) => {
        if (m.from === "system") {
          return (
            <div key={m.id} className="flex justify-center py-1">
              <span className="max-w-[90%] rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-center text-[11px] leading-4 text-slate-500 shadow-sm">
                {m.text}
              </span>
            </div>
          );
        }

        const mine = m.from === "me";
        return (
          <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 break-words whitespace-pre-wrap shadow-sm ${mine ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>
              <div className={`mb-0.5 text-[10px] font-semibold uppercase tracking-wide ${mine ? "text-blue-100" : "text-slate-400"}`}>
                {mine ? "You" : "Stranger"}
              </div>
              <span>{m.text}</span>
            </div>
          </div>
        );
      })}

      {partnerTyping && (
        <div className="flex justify-start" aria-label="Stranger is typing">
          <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
            <span className="sr-only">Stranger is typing</span>
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
