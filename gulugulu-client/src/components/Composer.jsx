import { useRef, useState } from "react";
import { MAX_MESSAGE_LEN } from "../lib/constants";

export default function Composer({ onSend, onTyping, disabled, placeholder }) {
  const [text, setText] = useState("");
  const typingOn = useRef(false);
  const inputRef = useRef(null);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t.slice(0, MAX_MESSAGE_LEN));
    setText("");
    if (typingOn.current) {
      typingOn.current = false;
      onTyping(false);
    }
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
      <input
        ref={inputRef}
        aria-label="Message"
        value={text}
        disabled={disabled}
        onChange={(e) => {
          setText(e.target.value);
          const on = e.target.value.length > 0;
          if (on !== typingOn.current) {
            typingOn.current = on;
            onTyping(on);
          }
        }}
        placeholder={placeholder || "Type a message…"}
        maxLength={MAX_MESSAGE_LEN}
        className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition disabled:opacity-60 disabled:bg-slate-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-4 sm:px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm disabled:opacity-40 disabled:bg-slate-300 disabled:text-slate-500 hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 transition shadow-sm"
      >
        Send
      </button>
    </form>
  );
}