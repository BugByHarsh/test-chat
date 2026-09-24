import { useEffect } from "react";
import { useChat } from "../store/chatStore";

export default function Toasts() {
  const { toasts, dismissToast } = useChat();

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => setTimeout(() => dismissToast(t.id), 4000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[min(90vw,420px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`px-4 py-3 rounded-xl text-sm cursor-pointer shadow-lg border backdrop-blur ${
            t.kind === "error"
              ? "bg-red-50/95 border-red-200 text-red-800"
              : t.kind === "success"
              ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
              : "bg-white/95 border-neutral-200 text-neutral-800"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}