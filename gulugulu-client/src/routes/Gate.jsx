import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useChat } from "../store/chatStore";
import { socket } from "../lib/socket";

const MODE_LABELS = {
  text: { label: "Text", icon: "💬" },
  voice: { label: "Voice", icon: "🎙️" },
  video: { label: "Video", icon: "🎥" },
};

export default function Gate() {
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const setMode = useChat((s) => s.setMode);

  const requestedMode = params.get("mode");
  const initialMode = ["text", "voice", "video"].includes(requestedMode)
    ? requestedMode
    : "text";

  const modeMeta = MODE_LABELS[initialMode];
  const ok = age && terms;

  const go = () => {
    if (!ok) return;

    setMode(initialMode);

    const confirmAge = () => socket.emit("confirm_age");
    if (socket.connected) {
      confirmAge();
    } else {
      socket.connect();
      socket.once("connect", confirmAge);
    }

    nav("/chat");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && ok) {
        go();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ok]);

  return (
    <div className="min-h-full flex flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="w-full border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl leading-none transition-transform group-hover:-rotate-6">
              🦆
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Gulugulu
            </span>
          </Link>

          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            Back
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
            {/* Mode */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                <span>{modeMeta.icon}</span>
                {modeMeta.label} mode
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-center tracking-tight text-slate-900">
              Before you start
            </h1>

            <p className="mt-2 text-sm text-slate-500 text-center">
              Two quick confirmations, then you're in.
            </p>

            {/* Checkboxes */}
            <div className="mt-7 space-y-3">
              <CheckRow
                checked={age}
                onChange={setAge}
                icon="18+"
                title="I am 18 years or older"
                description="Gulugulu is strictly for adults."
              />

              <CheckRow
                checked={terms}
                onChange={setTerms}
                icon="✓"
                title="I accept the rules"
                description={
                  <>
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-blue-600 hover:text-blue-700 underline underline-offset-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </Link>
                    .
                  </>
                }
              />
            </div>

            {/* Safety */}
            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-3 text-xs text-slate-600">
              <div className="flex gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center font-bold">
                  !
                </span>

                <p className="leading-5">
                  <strong className="text-slate-800">Keep it respectful.</strong>{" "}
                  No nudity, harassment, or minors. Use Report if someone
                  breaks the rules.
                </p>
              </div>
            </div>

            {/* CTA */}
            <button
              disabled={!ok}
              onClick={go}
              className={`mt-6 w-full py-3.5 rounded-lg font-semibold text-sm transition-colors ${
                ok
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {ok ? "Continue →" : "Check both boxes to continue"}
            </button>

            {/* Privacy note */}
            <p className="mt-4 text-[11px] leading-5 text-center text-slate-400">
              Chats are not logged. Video uses peer-to-peer connection.
            </p>
          </div>

          {/* Keyboard hint */}
          <p className="mt-5 text-center text-xs text-slate-400">
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 font-mono text-[10px]">
              Enter
            </kbd>{" "}
            to continue
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link to="/terms" className="hover:text-slate-700 transition-colors">
            Terms
          </Link>

          <span className="text-slate-200">·</span>

          <Link to="/privacy" className="hover:text-slate-700 transition-colors">
            Privacy
          </Link>

          <span className="text-slate-200">·</span>

          <Link to="/safety" className="hover:text-slate-700 transition-colors">
            Safety
          </Link>
        </div>
      </footer>
    </div>
  );
}

function CheckRow({ checked, onChange, icon, title, description }) {
  return (
    <label
      className={`flex gap-3 items-start p-3.5 rounded-lg border cursor-pointer transition-colors ${
        checked
          ? "border-blue-300 bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className="relative flex items-center justify-center mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />

        <span
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            checked
              ? "bg-blue-600 border-blue-600"
              : "bg-white border-slate-300"
          }`}
        >
          {checked && (
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="w-3.5 h-3.5 text-white"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 10l4 4 8-8" />
            </svg>
          )}
        </span>
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <span className="w-5 h-5 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 flex items-center justify-center">
            {icon}
          </span>
          {title}
        </span>

        <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
          {description}
        </span>
      </span>
    </label>
  );
}