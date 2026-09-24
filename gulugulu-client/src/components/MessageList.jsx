import { useEffect, useRef, useState } from "react";
import { useChat } from "../store/chatStore";

export default function MessageList() {
  const { messages, partnerTyping } = useChat();
  const ref = useRef(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (locked) return;

    const el = ref.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, [messages.length, partnerTyping, locked]);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setLocked(!nearBottom);
  };

  return (
    <div ref={ref} onScroll={onScroll} className="h-full overflow-y-auto bg-white px-2 sm:px-3 py-2 space-y-2">
      {messages.map((m) => {
        if (m.from === "system") {
          return (
            <div key={m.id} className="flex justify-center my-3">
              <span className="text-[11px] text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                {m.text}
              </span>
            </div>
          );
        }

        const mine = m.from === "me";

        return (
          <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-2.5 py-2 text-sm break-words whitespace-pre-wrap rounded-lg ${mine ? "bg-slate-50 text-slate-700" : "bg-red-50 text-slate-700"}`}>
              <span className={`font-bold ${mine ? "text-blue-500" : "text-red-500"}`}>
                {mine ? "You:" : "Stranger:"}
              </span>{" "}
              <span>{m.text}</span>
            </div>
          </div>
        );
      })}

      {partnerTyping && (
        <div className="flex justify-start">
          <div className="bg-red-50 rounded-lg px-2.5 py-2 text-sm">
            <span className="font-bold text-red-500">Stranger:</span>{" "}
            <span className="inline-flex gap-1 ml-1 align-middle">
              <span className="w-1 h-1 rounded-full bg-red-300 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1 h-1 rounded-full bg-red-300 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1 h-1 rounded-full bg-red-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}