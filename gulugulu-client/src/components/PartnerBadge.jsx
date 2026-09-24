export default function PartnerBadge({ type }) {
  if (!type) return null;

  const isBot = type === "bot";
  return (
    <span
      className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full border ${
        isBot
          ? "border-purple-200 bg-purple-50 text-purple-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isBot ? "bot" : "stranger"}
    </span>
  );
}