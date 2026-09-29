import { Link } from "react-router-dom";
import Seo from "../components/Seo";

const MODES = [
  {
    id: "text",
    label: "Text chat",
    to: "/gate?mode=text",
    icon: "💬",
    tagline: "A quick conversation, no camera needed.",
    badge: "Text",
  },
  {
    id: "voice",
    label: "Voice chat",
    to: "/gate?mode=voice",
    icon: "🎙️",
    tagline: "Talk naturally without video.",
    badge: "Audio",
  },
  {
    id: "video",
    label: "Video chat",
    to: "/gate?mode=video",
    icon: "🎥",
    tagline: "Meet face to face when you're ready.",
    badge: "Video",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Confirm you're 18+",
    description: "Review the rules and confirm you're eligible to use Gulugulu.",
  },
  {
    n: "02",
    title: "Choose a mode",
    description: "Start with text, or use voice and video when you prefer.",
  },
  {
    n: "03",
    title: "Meet someone new",
    description: "Get matched for a conversation. You can leave whenever you want.",
  },
];

export default function Landing() {
  return (
    <>
      <Seo />
      <div className="min-h-full flex flex-col bg-white text-slate-900">
      <header className="sticky top-0 z-30 w-full border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Gulugulu home">
            <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-sm shadow-blue-200 transition-transform group-hover:-rotate-6">
              🦆
            </span>
            <span className="text-lg font-bold tracking-tight">Gulugulu</span>
          </Link>

          <nav aria-label="Main navigation" className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-500">
            <Link to="/safety" className="hover:text-blue-600 transition-colors">Safety</Link>
            <Link to="/terms" className="hidden sm:inline hover:text-blue-600 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-blue-50/70 via-white to-white pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 lg:pt-24 pb-16 sm:pb-20">
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-16 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 text-xs font-semibold text-blue-700 shadow-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Anonymous conversations, your way
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold tracking-tight leading-[1.06] text-slate-950">
                  A new conversation
                  <br className="hidden sm:block" />
                  <span className="text-blue-600"> starts here.</span>
                </h1>

                <p className="mt-6 text-base sm:text-lg leading-7 text-slate-600 max-w-xl mx-auto lg:mx-0">
                  Meet someone new through text, voice, or video. No account or profile needed—just choose how you'd like to talk.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link
                    to="/gate?mode=text"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg shadow-blue-200/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                  >
                    Text Chat <span aria-hidden="true">↓</span>
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                  >
                    How it works
                  </a>
                </div>

                <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="text-emerald-600">✓</span> 18+ only</span>
                  <span className="flex items-center gap-1.5"><span className="text-emerald-600">✓</span> No signup</span>
                  <span className="flex items-center gap-1.5"><span className="text-emerald-600">✓</span> Skip anytime</span>
                </div>
              </div>

              <div id="modes" className="w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto scroll-mt-24">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xl shadow-slate-200/50">
                  <div className="flex items-start justify-between gap-4 px-1 pb-4">
                    <div>
                      <p className="text-base font-bold text-slate-900">How do you want to chat?</p>
                      <p className="mt-1 text-sm text-slate-500">Choose a mode to get started.</p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-400">3 modes</span>
                  </div>

                  <div className="space-y-3">
                    {MODES.map((mode) => (
                      <Link
                        key={mode.id}
                        to={mode.to}
                        className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-md hover:shadow-blue-100/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                      >
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:bg-white">
                          {mode.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{mode.label}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{mode.badge}</span>
                          </div>
                          <p className="mt-1 text-sm leading-5 text-slate-500">{mode.tagline}</p>
                        </div>
                        <span aria-hidden="true" className="text-lg text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">→</span>
                      </Link>
                    ))}
                  </div>

                  <p className="mt-4 px-1 text-xs leading-5 text-slate-500">
                    Conversations aren't kept as permanent chat history. Messages may be included in a report if someone reports a conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-slate-100 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 mb-3">Simple by design</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">From choosing a mode to saying hello.</h2>
              <p className="mt-3 text-sm sm:text-base leading-6 text-slate-500">No long setup. Just a few clear steps before your conversation.</p>
            </div>

            <ol className="grid md:grid-cols-3 gap-4 sm:gap-5">
              {STEPS.map((step) => (
                <li key={step.n} className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold mb-5">{step.n}</div>
                  <h3 className="font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex gap-3">
              <span className="shrink-0 w-9 h-9 rounded-xl bg-white border border-amber-200 text-amber-700 flex items-center justify-center font-bold">!</span>
              <div>
                <h2 className="font-semibold text-slate-900">Your safety comes first.</h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-600 max-w-2xl">
                  Gulugulu is for adults. Don't share sensitive personal information, and report harassment or rule-breaking. You can leave a conversation at any time.
                </p>
              </div>
            </div>
            <Link to="/safety" className="shrink-0 inline-flex items-center justify-center rounded-lg bg-white border border-amber-200 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-amber-100 transition-colors">
              Read safety rules <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Gulugulu. Be kind. Keep it respectful.</p>
          <nav aria-label="Legal navigation" className="flex items-center gap-4 sm:gap-5">
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link to="/safety" className="hover:text-slate-900 transition-colors">Safety</Link>
          </nav>
        </div>
      </footer>
      </div>
    </>
  );
}
