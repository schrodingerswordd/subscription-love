import { useEffect, useState } from "react";
import { WifiOff, Cloud } from "lucide-react";
import { formatSyncedAt } from "@/lib/offline-cache";

interface Props {
  /** Timestamp (ms) of last successful network fetch. */
  lastSyncedAt: number | null;
  /** True when the most recent fetch failed and we're showing cached data. */
  servingCache: boolean;
}

/** Subtle banner shown above content when we're offline / serving cached data. */
export function OfflineBadge({ lastSyncedAt, servingCache }: Props) {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    function up() { setOnline(true); }
    function down() { setOnline(false); }
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (online && !servingCache) return null;

  const Icon = online ? Cloud : WifiOff;
  const label = online ? "Showing last synced data" : "Offline — showing last synced data";

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto mt-3 flex max-w-3xl items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-2 text-xs text-muted-foreground"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="flex-1">
        {label}
        {lastSyncedAt ? <span className="ml-1 opacity-80">· last sync {formatSyncedAt(lastSyncedAt)}</span> : null}
      </span>
    </div>
  );
}
