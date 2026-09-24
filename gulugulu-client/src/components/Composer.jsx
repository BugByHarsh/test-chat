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
        className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition disabled:opacity-50 disabled:bg-neutral-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-sm disabled:opacity-40 disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-500 hover:from-blue-500 hover:to-cyan-400 transition shadow-sm shadow-blue-300/50"
      >
        Send
      </button>
    </form>
  );
}