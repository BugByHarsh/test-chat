import { useState } from "react";
import { useChat } from "../store/chatStore";

const MAX_INTERESTS = 5;

export default function InterestInput() {
  const { interests, toggleInterest } = useChat();
  const [value, setValue] = useState("");

  const addInterest = () => {
    const interest = value.trim();

    if (!interest) return;
    if (interests.length >= MAX_INTERESTS) return;

    const exists = interests.some(
      (item) => item.toLowerCase() === interest.toLowerCase()
    );

    if (exists) {
      setValue("");
      return;
    }

    toggleInterest(interest);
    setValue("");
  };

  const removeInterest = (interest) => {
    toggleInterest(interest);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">
          Interests <span className="text-slate-400">(optional)</span>
        </span>

        <span className="text-xs text-slate-400">
          {interests.length}/{MAX_INTERESTS}
        </span>
      </div>

      <div className="min-h-11 flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-white focus-within:border-blue-400 transition-colors">
        {interests.map((interest) => (
          <span
            key={interest}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-blue-600"
          >
            {interest}

            <button
              type="button"
              onClick={() => removeInterest(interest)}
              aria-label={`Remove ${interest}`}
              className="text-blue-400 hover:text-blue-700 leading-none"
            >
              ×
            </button>
          </span>
        ))}

        {interests.length < MAX_INTERESTS && (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              interests.length
                ? "Add another…"
                : "e.g. gaming, music, anime…"
            }
            className="flex-1 min-w-[140px] px-1 py-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
          />
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-slate-400">
        Press Enter to add an interest
      </p>
    </div>
  );
}