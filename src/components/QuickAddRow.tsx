import { Link } from "@tanstack/react-router";
import { ServiceAvatar } from "@/components/ServiceAvatar";
import { QUICK_ADD_NAMES, SERVICE_PRESETS, formatCurrency } from "@/lib/services";

export function QuickAddRow() {
  const items = QUICK_ADD_NAMES
    .map((n) => SERVICE_PRESETS.find((p) => p.name === n))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">Quick add</h2>
        <span className="text-xs text-muted-foreground">Tap to prefill</span>
      </div>
      <div className="mt-2 -mx-4 overflow-x-auto px-4 pb-1">
        <ul className="flex gap-2">
          {items.map((p) => (
            <li key={p.name} className="shrink-0">
              <Link
                to="/app/add"
                search={{ preset: p.name }}
                className="flex w-24 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-card-soft transition hover:shadow-elegant active:scale-95"
              >
                <ServiceAvatar name={p.name} size={40} />
                <span className="line-clamp-1 text-xs font-medium">{p.name}</span>
                {p.defaultCost != null && (
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {formatCurrency(p.defaultCost)}/mo
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
