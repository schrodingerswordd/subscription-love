import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceAvatar } from "@/components/ServiceAvatar";
import { SERVICE_PRESETS } from "@/lib/services";

type Status = "loading" | "ok" | "failed";

export const Route = createFileRoute("/app/debug-icons")({
  head: () => ({
    meta: [{ title: "Icon debug — SubTrack" }],
  }),
  component: DebugIcons,
});

function DebugIcons() {
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    Object.fromEntries(SERVICE_PRESETS.map((p) => [p.name, "loading" as Status])),
  );
  const [selected, setSelected] = useState<string | null>(null);

  function setStatus(name: string, status: Status) {
    setStatuses((prev) => (prev[name] === status ? prev : { ...prev, [name]: status }));
  }

  const total = SERVICE_PRESETS.length;
  const okCount = Object.values(statuses).filter((s) => s === "ok").length;
  const failedCount = Object.values(statuses).filter((s) => s === "failed").length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/app">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <div className="flex gap-2 text-xs">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {okCount} ok
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <XCircle className="h-3 w-3 text-destructive" /> {failedCount} failed
          </Badge>
          <Badge variant="outline">{total} total</Badge>
        </div>
      </div>

      <h1 className="text-2xl font-bold">Icon debug</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Each preset attempts to load its logo from the simple-icons CDN. If the request
        fails (404, network, CORS), the avatar falls back to initials. Tap a row to see
        the exact URL and reason.
      </p>

      <ul className="mt-5 space-y-2">
        {SERVICE_PRESETS.map((p) => {
          const status = statuses[p.name];
          const url = p.slug ? `https://cdn.simpleicons.org/${p.slug}/white` : null;
          const isOpen = selected === p.name;

          return (
            <li
              key={p.name}
              className="rounded-2xl border border-border bg-card shadow-card-soft"
            >
              <button
                type="button"
                onClick={() => setSelected(isOpen ? null : p.name)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <ServiceAvatar name={p.name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{p.name}</p>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {p.slug ?? "—"}
                    </code>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {url ?? "no slug — always falls back to initials"}
                  </p>
                </div>
                <StatusPill status={status} hasSlug={!!p.slug} />

                {/* Hidden probe image to detect load success/failure */}
                {url && (
                  <img
                    src={url}
                    alt=""
                    aria-hidden
                    className="hidden"
                    onLoad={() => setStatus(p.name, "ok")}
                    onError={() => setStatus(p.name, "failed")}
                  />
                )}
              </button>

              {isOpen && (
                <div className="space-y-2 border-t border-border p-3 text-xs">
                  <Row label="Brand color">
                    <span
                      className="inline-block h-3 w-3 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: p.color }}
                    />{" "}
                    <code>{p.color}</code>
                  </Row>
                  <Row label="Category">
                    <code>{p.category}</code>
                  </Row>
                  <Row label="Slug">
                    <code>{p.slug ?? "(none)"}</code>
                  </Row>
                  <Row label="CDN URL">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-primary underline"
                      >
                        {url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </Row>
                  <Row label="Reason">
                    <span className="text-muted-foreground">
                      {!p.slug
                        ? "No simple-icons slug defined for this preset → renders initials."
                        : status === "failed"
                          ? `Image failed to load (likely 404 — slug "${p.slug}" not found on cdn.simpleicons.org, or network blocked). Avatar falls back to initials.`
                          : status === "loading"
                            ? "Probe still loading…"
                            : "Logo loaded successfully — avatar shows the brand SVG tinted for contrast."}
                    </span>
                  </Row>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}

function StatusPill({ status, hasSlug }: { status: Status; hasSlug: boolean }) {
  if (!hasSlug) {
    return (
      <Badge variant="outline" className="gap-1">
        <XCircle className="h-3 w-3" /> no slug
      </Badge>
    );
  }
  if (status === "ok") {
    return (
      <Badge variant="secondary" className="gap-1 text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3" /> ok
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" /> failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Loader2 className="h-3 w-3 animate-spin" /> loading
    </Badge>
  );
}
