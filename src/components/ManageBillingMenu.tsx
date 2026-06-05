import { useState } from "react";
import { ExternalLink, Settings, Loader2, Ban, Receipt } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useServerFn } from "@tanstack/react-start";
import { createPortalSession, cancelSubscription } from "@/server/billing.functions";
import { createStripePortalSession } from "@/server/stripe.functions";
import { useSubscription } from "@/hooks/useSubscription";
import { getPaddleEnvironment } from "@/lib/paddle";
import { toast } from "sonner";

export function ManageBillingMenu() {
  const { isPremium, cancelAtPeriodEnd, refresh, subscriptionId } = useSubscription();
  const paddlePortal = useServerFn(createPortalSession);
  const stripePortal = useServerFn(createStripePortalSession);
  const cancel = useServerFn(cancelSubscription);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isPremium) return null;

  async function extractMessage(e: unknown): Promise<string> {
    if (e instanceof Response) {
      try {
        const txt = await e.clone().text();
        try { const j = JSON.parse(txt); return j?.message || j?.error || txt || `HTTP ${e.status}`; }
        catch { return txt || `HTTP ${e.status}`; }
      } catch { return `HTTP ${e.status}`; }
    }
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    try { return JSON.stringify(e); } catch { return "Unknown error"; }
  }

  async function openPortal() {
    setLoading(true);
    try {
      if (subscriptionId?.startsWith("sub_")) {
        const { url } = await stripePortal();
        if (url) window.open(url, "_blank", "noopener");
        else toast.error("No portal URL returned");
      } else {
        const { url } = await paddlePortal({ data: { environment: getPaddleEnvironment() } });
        if (url) window.open(url, "_blank", "noopener");
        else toast.error("No portal URL returned");
      }
    } catch (e) {
      console.error("openPortal failed", e);
      toast.error(await extractMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function doCancel() {
    setLoading(true);
    try {
      await cancel({ data: { environment: getPaddleEnvironment() } });
      toast.success("Cancelled — you'll keep premium until the end of the billing period");
      refresh();
    } catch (e) {
      console.error("cancelSubscription failed", e);
      toast.error(await extractMessage(e));
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground" aria-label="Manage billing">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={openPortal} disabled={loading}>
            <ExternalLink className="h-4 w-4" /> Manage billing
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/app/billing">
              <Receipt className="h-4 w-4" /> Billing history
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            disabled={loading || cancelAtPeriodEnd}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="h-4 w-4" /> {cancelAtPeriodEnd ? "Cancellation scheduled" : "Cancel premium"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel premium?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll keep premium features until the end of your current billing period. No refund will be issued.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Keep premium</AlertDialogCancel>
            <AlertDialogAction onClick={doCancel} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Confirm cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
