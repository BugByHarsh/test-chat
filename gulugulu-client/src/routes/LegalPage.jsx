import { Link, useLocation } from "react-router-dom";

const CONTENT = {
  terms: {
    title: "Terms",
    sections: [
      ["Eligibility", "Gulugulu is intended for people aged 18 or older. You must not use the service if you are under 18."],
      ["Acceptable use", "Do not use Gulugulu for harassment, threats, sexual content involving minors, non-consensual sexual content, illegal activity, or attempts to compromise the service."],
      ["Anonymous service", "Gulugulu does not require an account or profile. Conversations are temporary and are not permanently stored as chat history."],
      ["Reports", "When a user submits a report, recent room messages and, for eligible video reports, a captured frame may be included temporarily for moderation."],
    ],
  },
  privacy: {
    title: "Privacy",
    sections: [
      ["What we collect", "Gulugulu does not require a name, email address, or account. The service processes connection and session information needed to operate matching, moderation, and abuse prevention."],
      ["Temporary conversations", "Chat messages are held in server memory while a room is active and may be included in a submitted report. They are not intended to be kept as permanent chat history."],
      ["Reports and moderation", "A report can contain recent messages and, when applicable, a video frame. Moderation records may include hashed network information used for abuse prevention."],
      ["WebRTC", "Voice and video use peer-to-peer WebRTC connections. Signaling data is relayed through the server to establish the connection."],
    ],
  },
  safety: {
    title: "Safety",
    sections: [
      ["18+ only", "Do not use Gulugulu if you are under 18. Do not ask another user for sexual content involving a minor."],
      ["Keep it respectful", "Do not harass, threaten, expose private information, or send unwanted sexual content."],
      ["Report", "Use the Report button when another user breaks the rules. Reports may include recent messages and, for video, a captured frame."],
      ["Leave anytime", "You can skip a conversation at any time. Do not share sensitive personal information with strangers."],
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const page = CONTENT[pathname.slice(1)] || CONTENT.safety;

  return (
    <div className="min-h-full bg-white text-slate-900">
      <header className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold">🦆 Gulugulu</Link>
          <Link to="/gate?mode=text" className="text-sm text-blue-600">Start chatting →</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-bold">{page.title}</h1>
        <div className="mt-8 space-y-7">
          {page.sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
