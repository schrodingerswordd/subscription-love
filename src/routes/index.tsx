import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Bell, ShieldCheck, Sparkles, Wallet, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SubTrack — Take control of your subscriptions" },
      { name: "description", content: "Track every subscription in one place. See your true monthly spend and cancel what you don't use." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SubTrack</span>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Button asChild>
                <Link to="/app">Open app</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-gradient-primary hover:opacity-90">
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-soft" />
        <div className="absolute -top-32 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-30 blur-3xl bg-gradient-primary" />

        <div className="mx-auto max-w-5xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Personal finance, simplified</span>
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Never get surprised by a{" "}
            <span className="text-gradient">subscription charge</span> again
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            SubTrack brings every recurring payment into one beautiful dashboard.
            See your true monthly spend, spot creeping costs, and cancel what you don't use.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="w-full bg-gradient-primary hover:opacity-90 sm:w-auto">
              <Link to={user ? "/app" : "/signup"}>
                Get started — it's free <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            {!user && (
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/login">I already have an account</Link>
              </Button>
            )}
          </div>

          {/* Hero preview card */}
          <div className="relative mx-auto mt-14 max-w-md">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-primary opacity-20 blur-2xl" />
            <div className="rounded-3xl border border-border bg-card p-6 text-left shadow-card-soft">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Monthly spend
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight text-gradient">$87.42</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { name: "Netflix", price: "$15.99", color: "#E50914" },
                  { name: "Spotify", price: "$10.99", color: "#1DB954" },
                  { name: "ChatGPT Plus", price: "$20.00", color: "#10A37F" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold text-white"
                        style={{ backgroundColor: s.color }}
                      >
                        {s.name[0]}
                      </div>
                      <span className="text-sm font-medium">{s.name}</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{s.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for people who like to know
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Three simple tools to take back control of recurring spend.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: "Track everything",
              text: "Add every subscription with cost, billing cycle, and category — even weekly and yearly ones.",
            },
            {
              icon: BarChart3,
              title: "Visualize spend",
              text: "Beautiful charts show what you're actually paying, normalized to monthly so the math is honest.",
            },
            {
              icon: Bell,
              title: "Stay ahead",
              text: "See your next billing date at a glance and cancel before the next charge hits.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card-soft transition hover:shadow-elegant">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-soft py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to clarity
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { n: "1", title: "Sign up", text: "Create your free account in under 30 seconds." },
              { n: "2", title: "Add subscriptions", text: "Type in what you pay for. We auto-suggest popular services." },
              { n: "3", title: "See the truth", text: "One big number tells you what you spend every month." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-card-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-base font-bold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Your data stays yours</h2>
        <p className="mt-3 text-muted-foreground">
          We never connect to your bank. You enter what you want to track — nothing more.
        </p>
        <ul className="mt-6 inline-flex flex-col gap-2 text-left text-sm">
          {[
            "No bank credentials required",
            "Encrypted in transit and at rest",
            "Delete your account at any time",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-hero px-8 py-14 text-center text-primary-foreground shadow-elegant sm:py-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to know what you actually spend?
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">
            Join SubTrack today. Free forever for personal use.
          </p>
          <Button size="lg" asChild variant="secondary" className="mt-7">
            <Link to={user ? "/app" : "/signup"}>
              Start tracking — free <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-primary">
              <Wallet className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SubTrack</span>
          </div>
          <p>© {new Date().getFullYear()} SubTrack. Made for clarity.</p>
        </div>
      </footer>
    </div>
  );
}
