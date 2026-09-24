import { Link } from "react-router-dom";

const MODES = [
  {
    id: "text",
    label: "Text",
    to: "/gate?mode=text",
    icon: "💬",
    tagline: "Fast, anonymous, no camera.",
    badge: "No signup",
  },
  {
    id: "voice",
    label: "Voice",
    to: "/gate?mode=voice",
    icon: "🎙️",
    tagline: "Talk naturally without video.",
    badge: "Low bandwidth",
  },
  {
    id: "video",
    label: "Video",
    to: "/gate?mode=video",
    icon: "🎥",
    tagline: "Face to face with a stranger.",
    badge: "Peer-to-peer",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Pass the gate",
    description: "Confirm you're 18+ and accept the rules.",
  },
  {
    n: "2",
    title: "Choose your way",
    description: "Pick text, voice, or video.",
  },
  {
    n: "3",
    title: "Start talking",
    description: "Meet someone random. Skip whenever you want.",
  },
];

export default function Landing() {
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

          <nav className="flex items-center gap-5 text-sm text-slate-500">
            <Link to="/terms" className="hover:text-slate-900 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 lg:pt-24 pb-14">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live now · meet someone in seconds
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.04] text-slate-900">
                Talk to strangers,
                <br />
                <span className="text-blue-600">your way.</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg leading-7 text-slate-500 max-w-xl mx-auto lg:mx-0">
                Random conversations with real people. Text, voice, or video.
                No signup, no profile, and no chat history.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/gate?mode=text"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
                >
                  Start chatting
                  <span aria-hidden="true">→</span>
                </Link>

                <Link
                  to="/gate?mode=video"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Try video
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span>
                  18+ only
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span>
                  No signup
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span>
                  No chat logs
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-500">✓</span>
                  Skip anytime
                </span>
              </div>
            </div>

            {/* Right: modes */}
            <div className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Choose a mode
                </span>
                <span className="text-xs text-slate-400">
                  Start in seconds
                </span>
              </div>

              <div className="space-y-3">
                {MODES.map((mode) => (
                  <Link
                    key={mode.id}
                    to={mode.to}
                    className="group flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-slate-200/60 transition-all duration-200"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl">
                      {mode.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {mode.label}
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {mode.badge}
                        </span>
                      </div>

                      <p className="mt-0.5 text-sm text-slate-500 truncate">
                        {mode.tagline}
                      </p>
                    </div>

                    <span className="text-lg text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
                      →
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Your conversation is temporary.{" "}
                  <span className="font-medium text-slate-700">
                    Nothing to remember.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="border-t border-slate-100" />
        </div>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
              Simple by design
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              From zero to conversation.
            </h2>

            <p className="mt-3 text-sm sm:text-base text-slate-500">
              No account. No profile. Just pick a mode and go.
            </p>
          </div>

          <ol className="grid md:grid-cols-3 gap-4 sm:gap-5">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-white"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold mb-5">
                  {step.n}
                </div>

                <h3 className="font-semibold text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Safety */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-5 py-7 sm:px-8 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-sm font-bold">
                  !
                </span>
                <h2 className="font-semibold text-slate-900">
                  Keep it respectful.
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Gulugulu is for meeting people, not making them uncomfortable.
                No minors, no nudity, and no harassment.
              </p>
            </div>

            <Link
              to="/safety"
              className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Read safety rules →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Gulugulu. Be kind. No minors. No nudity.
          </p>

          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-slate-700 transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-slate-700 transition-colors">
              Privacy
            </Link>
            <Link to="/safety" className="hover:text-slate-700 transition-colors">
              Safety
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}