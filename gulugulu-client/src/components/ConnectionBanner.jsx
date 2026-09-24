import { useChat } from "../store/chatStore";

export default function ConnectionBanner() {
  const { connected, everConnected } = useChat();
  if (connected || !everConnected) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-4 py-2 text-center">
      Reconnecting…
    </div>
  );
}