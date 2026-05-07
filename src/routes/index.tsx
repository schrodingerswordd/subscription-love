import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Bell, Eye, Skull, Wallet, Zap, ShieldOff, Cpu,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SubTrack // Stop the corpos from siphoning your eddies" },
      { name: "description", content: "Choomba, every megacorp wants a slice of your account. SubTrack jacks into your subs, exposes the leech-rate, and helps you cut the cord — input/output." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();

  return (
    <div className="cyberpunk min-h-screen relative overflow-hidden">
      {/* Background layers */}
      <div className="cp-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="cp-scanlines pointer-events-none absolute inset-0 -z-10 opacity-50" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[640px] w-[640px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #ff2bd6 0%, transparent 60%)" }} />
      <div className="pointer-events-none absolute top-40 right-0 -z-10 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #00f0ff 0%, transparent 60%)" }} />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--cp-line)] bg-[rgba(7,6,13,0.7)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md"
              style={{
                background: "linear-gradient(135deg, #ff2bd6, #00f0ff)",
                boxShadow: "0 0 16px rgba(255,43,214,0.6)",
              }}
            >
              <Wallet className="h-4 w-4 text-black" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-[0.2em] cp-neon-text">SUBTRACK</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--cp-muted)]">v2.077 // night city</span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Link to="/app" className="cp-btn-primary rounded-md px-4 py-2 text-xs">
                Jack in →
              </Link>
            ) : (
              <>
                <Link to="/login" className="cp-btn-ghost hidden rounded-md px-4 py-2 text-xs sm:inline-block">
                  Log in
                </Link>
                <Link to="/signup" className="cp-btn-primary rounded-md px-4 py-2 text-xs">
                  Boot up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 text-center sm:px-6 sm:pt-24">
          <div className="mx-auto inline-flex items-center gap-2">
            <span className="cp-tag inline-flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> Wake the f*** up, samurai
            </span>
          </div>

          <h1 className="mt-8 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
            <span className="block text-[var(--cp-fg)]">Never let the</span>
            <span className="cp-glitch mt-1 block" data-text="BIG CORPOS">
              <span className="cp-neon-text">BIG CORPOS</span>
            </span>
            <span className="mt-1 block text-[var(--cp-fg)]">
              steal your <span className="cp-magenta">eddies</span> again
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-[var(--cp-muted)] sm:text-base">
            <span className="cp-cyan">&gt;</span> Every megacorp wants a slice of your account — Netflix, Spotify, the whole gang.{" "}
            <span className="text-[var(--cp-fg)]">SubTrack jacks into your subs</span>, exposes the leech-rate in real time, and helps you{" "}
            <span className="cp-magenta">cut the cord</span> before the next charge hits your wallet.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to={user ? "/app" : "/signup"}
              className="cp-btn-primary inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm sm:w-auto"
            >
              Take back control <ArrowRight className="h-4 w-4" />
            </Link>
            {!user && (
              <Link
                to="/login"
                className="cp-btn-ghost inline-flex w-full items-center justify-center rounded-md px-6 py-3 text-sm sm:w-auto"
              >
                I have an ID chip
              </Link>
            )}
          </div>

          {/* Glitchy stats strip */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-2 text-left sm:gap-4">
            {[
              { k: "$219", v: "avg leech / month" },
              { k: "12.4", v: "subs per user" },
              { k: "73%", v: "you forgot about" },
            ].map((s) => (
              <div key={s.v} className="cp-card rounded-md p-3 sm:p-4">
                <p className="cp-neon-text text-xl font-bold tabular-nums sm:text-2xl">{s.k}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--cp-muted)] sm:text-xs">
                  {s.v}
                </p>
              </div>
            ))}
          </div>

          {/* Hero terminal card */}
          <div className="relative mx-auto mt-14 max-w-md text-left">
            <div className="cp-card rounded-md p-5">
              <div className="flex items-center justify-between border-b border-[var(--cp-line)] pb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--cp-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--cp-magenta)] shadow-[0_0_6px_#ff2bd6]" />
                  netrunner.exe
                </span>
                <span>// LIVE</span>
              </div>
              <p className="mt-3 text-[10px] uppercase tracking-wider text-[var(--cp-muted)]">
                &gt; monthly_drain
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="cp-neon-text text-5xl font-black tabular-nums">€87.42</span>
                <span className="text-xs text-[var(--cp-muted)]">/ cycle</span>
              </div>
              <div className="mt-5 space-y-2">
                {[
                  { name: "Netflix", price: "€15.99", color: "#E50914" },
                  { name: "Spotify", price: "€10.99", color: "#1DB954" },
                  { name: "ChatGPT Plus", price: "€20.00", color: "#10A37F" },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-sm border border-[var(--cp-line)] bg-black/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-sm text-[11px] font-bold text-white"
                        style={{ backgroundColor: s.color, boxShadow: `0 0 12px ${s.color}66` }}
                      >
                        {s.name[0]}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {s.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold tabular-nums cp-cyan">{s.price}</span>
                  </div>
                ))}
              </div>
              <div className="cp-divider mt-4" />
              <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[var(--cp-muted)]">
                <span className="cp-magenta">&gt;</span> threat level: maximum
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <span className="cp-tag">// arsenal</span>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-5xl">
            Built for <span className="cp-neon-text">edgerunners</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--cp-muted)]">
            Three cyberdecks to slice through the corporate fog and audit every eddie they're skimming.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: Eye,
              title: "Surveil the corpos",
              text: "Every Netflix, Spotify, Adobe — logged, tagged, and exposed in one neon dashboard.",
            },
            {
              icon: Cpu,
              title: "Real-time leech-rate",
              text: "Weekly, monthly, yearly — all normalized to one big honest number that doesn't lie.",
            },
            {
              icon: ShieldOff,
              title: "Cut. The. Cord.",
              text: "Cancel before the charge hits and watch your savings stack like eddies in a stash.",
            },
          ].map((f) => (
            <div key={f.title} className="cp-card rounded-md p-6">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-sm"
                style={{
                  background: "linear-gradient(135deg, #ff2bd6, #00f0ff)",
                  boxShadow: "0 0 18px rgba(255,43,214,0.5)",
                }}
              >
                <f.icon className="h-5 w-5 text-black" />
              </div>
              <h3 className="mt-4 text-lg font-bold uppercase tracking-wider">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--cp-muted)]">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — terminal log style */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <span className="cp-tag">// 3-step jack-in</span>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-5xl">
            From <span className="cp-magenta">flatlined</span> to <span className="cp-cyan">in control</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { n: "01", t: "Sign in", d: "Drop your handle. No bank creds, no chrome required." },
            { n: "02", t: "Log the leeches", d: "Type each subscription. We auto-detect the megacorp." },
            { n: "03", t: "See the truth", d: "One number. Total drain. Total clarity. Total power." },
          ].map((s) => (
            <div key={s.n} className="cp-card rounded-md p-6">
              <p className="cp-neon-text text-3xl font-black tabular-nums">{s.n}</p>
              <h3 className="mt-3 text-lg font-bold uppercase tracking-wider">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--cp-muted)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto / trust block */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <Skull className="mx-auto h-10 w-10 text-[var(--cp-magenta)]" style={{ filter: "drop-shadow(0 0 12px #ff2bd6)" }} />
        <h2 className="mt-4 text-2xl font-black uppercase tracking-wider sm:text-3xl">
          Your data is <span className="cp-cyan">yours</span>, choomba
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--cp-muted)]">
          We don't touch your bank. We don't sell your soul to Arasaka. You enter what you want to track — nothing more, nothing less. Net runner ethics.
        </p>
        <ul className="mt-6 inline-flex flex-col gap-2 text-left text-xs uppercase tracking-wider">
          {[
            "Zero bank credentials",
            "Encrypted in the wire and on disk",
            "Wipe your account anytime",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2 text-[var(--cp-fg)]">
              <span className="cp-cyan">&gt;</span> {t}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <span className="cp-tag">// intel.dump</span>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-5xl">
            Frequently <span className="cp-neon-text">decrypted</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--cp-muted)]">
            Straight answers, no corpo doublespeak.
          </p>
        </div>
        <div className="mt-10 space-y-3">
          {[
            {
              q: "Will you actually remind me before they charge me?",
              a: "Yeah. Three days before the next charge, the sub goes loud on your dashboard — name, price, countdown. No 6am push notifications. No \"WE MISS YOU\" emails. Just the info, where you'll see it, when it matters.",
            },
            {
              q: "Why \"cancel\" instead of just deleting it?",
              a: "Because deleting it pretends you never paid for it. Cancelling keeps the receipt, freezes the bleeding, and dumps every dollar you stop paying straight into the Savings counter. You get to watch the number go up. That's the whole point.",
            },
            {
              q: "What do you do with my data?",
              a: "Nothing. We don't have your bank, your card, or your soul — you type what you want to track, that's it. Your row, your rules, locked behind your login. No ads, no resale, no \"trusted partners.\" If that ever changes, we shut down. Easier that way.",
            },
            {
              q: "Can I delete everything?",
              a: "One click. Account, subs, history — gone, no exit survey, no \"are you sure?\" guilt trip. We're not Adobe.",
            },
          ].map((item) => (
            <details
              key={item.q}
              className="cp-card group rounded-md p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-left">
                <span className="text-sm font-bold uppercase tracking-wider text-[var(--cp-fg)] sm:text-base">
                  <span className="cp-cyan">&gt;</span> {item.q}
                </span>
                <span className="cp-magenta text-xl font-black transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 border-t border-[var(--cp-line)] pt-3 text-sm leading-relaxed text-[var(--cp-muted)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="cp-card rounded-md p-10 text-center sm:p-14">
            <Bell className="mx-auto h-8 w-8 text-[var(--cp-yellow)]" style={{ filter: "drop-shadow(0 0 12px #fcee0a)" }} />
            <h2 className="mt-4 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Time to <span className="cp-neon-text">unplug</span> the leeches
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--cp-muted)]">
              Free forever for solo runners. Boot up and reclaim your eddies in under 30 seconds.
            </p>
            <Link
              to={user ? "/app" : "/signup"}
              className="cp-btn-primary mt-7 inline-flex items-center gap-2 rounded-md px-7 py-3 text-sm"
            >
              Boot up subtrack <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--cp-line)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs uppercase tracking-wider text-[var(--cp-muted)] sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="cp-magenta">●</span>
            <span className="text-[var(--cp-fg)]">SUBTRACK</span>
            <span>// {new Date().getFullYear()} // night city</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="/pricing" className="hover:text-[var(--cp-fg)]">Pricing</Link>
            <Link to="/terms" className="hover:text-[var(--cp-fg)]">Terms</Link>
            <Link to="/privacy" className="hover:text-[var(--cp-fg)]">Privacy</Link>
            <Link to="/refund-policy" className="hover:text-[var(--cp-fg)]">Refunds</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
