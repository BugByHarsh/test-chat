import { useState } from "react";
import { useChat } from "../store/chatStore";
import { REPORT_REASONS } from "../lib/constants";
import { captureVideoFrame } from "../lib/frameCapture";

export default function ReportModal({ onReport }) {
  const { reportOpen, closeReport, mode, partnerType } = useChat();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  if (!reportOpen) return null;

  const submit = async () => {
    if (!reason) return;

    setBusy(true);

    let frame;

    if (mode === "video" && partnerType === "human") {
      frame = captureVideoFrame() || undefined;
    }

    onReport(reason, frame);

    setBusy(false);
    setReason("");
    closeReport();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Report user</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Help keep Gulugulu safe.
            </p>
          </div>

          <button
            onClick={closeReport}
            aria-label="Close report"
            className="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <p className="text-xs leading-5 text-slate-500">
          A snapshot of the last messages
          {mode === "video" ? " and current video frame" : ""} will be attached
          to the report.
        </p>

        <div className="space-y-1.5">
          {REPORT_REASONS.map((r) => {
            const on = reason === r.id;

            return (
              <label
                key={r.id}
                className={`flex items-center gap-3 text-sm cursor-pointer px-3 py-2.5 rounded-lg border transition-colors ${
                  on
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  checked={on}
                  onChange={() => setReason(r.id)}
                  className="sr-only"
                />

                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    on ? "border-red-500" : "border-slate-300"
                  }`}
                >
                  {on && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </span>

                <span className={on ? "text-red-700 font-medium" : "text-slate-700"}>
                  {r.label}
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={closeReport}
            className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            disabled={!reason || busy}
            onClick={submit}
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 active:bg-red-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {busy ? "Sending…" : "Submit report"}
          </button>
        </div>
      </div>
    </div>
  );
}