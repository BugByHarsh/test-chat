import { Link, useLocation } from "react-router-dom";

const CONTENT = {
  terms: {
    eyebrow: "The basics",
    title: "Terms of use",
    intro: "These rules explain the expectations for using Gulugulu. By continuing to use the service, you agree to follow them.",
    sections: [
      ["Eligibility", "Gulugulu is intended for people aged 18 or older. You must not use the service if you are under 18."],
      ["Acceptable use", "Do not use Gulugulu for harassment, threats, sexual content involving minors, non-consensual sexual content, illegal activity, or attempts to compromise the service."],
      ["Anonymous service", "Gulugulu does not require an account or profile. Conversations are temporary and are not permanently stored as chat history."],
      ["Reports and moderation", "When a user submits a report, recent room messages and, for eligible video reports, a captured frame may be included for moderation."],
      ["Availability", "The service may change or become unavailable. Do not rely on Gulugulu for emergency communications."],
    ],
  },
  privacy: {
    eyebrow: "Your information",
    title: "Privacy",
    intro: "Gulugulu is designed for conversations without accounts or public profiles. Some technical information is still processed to operate the service and help prevent abuse.",
    sections: [
      ["What we process", "Gulugulu does not require a name, email address, or account. The service processes connection and session information needed for matching, moderation, and abuse prevention."],
      ["Temporary conversations", "Chat messages are held in server memory while a room is active and may be included in a submitted report. They are not intended to be kept as permanent chat history."],
      ["Reports and moderation", "A report can contain recent messages and, when applicable, a video frame. Moderation records may include hashed network information used for abuse prevention."],
      ["Voice and video", "Voice and video use peer-to-peer WebRTC connections when possible. Signaling data is relayed through the server to establish the connection. Network details may be visible to the other peer as part of a peer-to-peer connection."],
      ["Your choices", "Do not share information you want to keep private. You can leave a conversation at any time and stop using the service whenever you choose."],
    ],
  },
  safety: {
    eyebrow: "Community rules",
    title: "Safety on Gulugulu",
    intro: "A good conversation requires respect. These rules apply to everyone using Gulugulu.",
    sections: [
      ["Adults only", "Do not use Gulugulu if you are under 18. Never request, share, or create sexual content involving a minor."],
      ["Respect boundaries", "Do not harass, threaten, expose private information, or send unwanted sexual content. If someone asks you to stop, stop."],
      ["Report rule-breaking", "Use the Report button when another user breaks the rules. Reports may include recent messages and, for video, a captured frame."],
      ["Protect your privacy", "Avoid sharing your address, phone number, passwords, financial information, or other sensitive details with strangers."],
      ["Leave when you need to", "You can skip a conversation at any time. If someone makes you uncomfortable, leave and report them."],
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const page = CONTENT[pathname.slice(1)] || CONTENT.safety;

  return (
    <div className="min-h-full flex flex-col bg-slate-50/70 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">🦆</span>
            Gulugulu
          </Link>
          <Link to="/gate?mode=text" className="inline-flex items-center rounded-lg bg-blue-600 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            Start chatting <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <nav aria-label="Legal pages" className="flex flex-wrap gap-2 mb-8">
          {[
            ["Terms", "/terms"],
            ["Privacy", "/privacy"],
            ["Safety", "/safety"],
          ].map(([label, to]) => (
            <Link key={to} to={to} aria-current={pathname === to ? "page" : undefined} className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${pathname === to ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:text-slate-900"}`}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-8 lg:gap-12 items-start">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{page.eyebrow}</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">{page.title}</h1>
            <p className="mt-4 text-sm sm:text-base leading-7 text-slate-600">{page.intro}</p>
            <div className="my-7 border-t border-slate-100" />
            <div className="space-y-7">
              {page.sections.map(([title, body], index) => (
                <section key={title} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="font-semibold text-slate-900">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
                  </div>
                </section>
              ))}
            </div>
            <p className="mt-8 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-400">
              This page provides general service information and is not legal advice. Review the policies carefully before using the service.
            </p>
          </article>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-slate-900">Quick links</p>
            <p className="mt-1 text-sm leading-5 text-slate-500">Know the rules before you start a conversation.</p>
            <div className="mt-4 space-y-2">
              <Link to="/safety" className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-amber-100 transition-colors">Safety rules <span>→</span></Link>
              <Link to="/privacy" className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">Privacy policy <span>→</span></Link>
              <Link to="/terms" className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">Terms of use <span>→</span></Link>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Gulugulu</span>
          <Link to="/" className="hover:text-slate-900 transition-colors">Back to home</Link>
        </div>
      </footer>
    </div>
  );
}
