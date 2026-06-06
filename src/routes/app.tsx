import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet, Crown, Bell, HardDrive } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { ManageBillingMenu } from "@/components/ManageBillingMenu";
import { SubscriptionStatusBanner } from "@/components/SubscriptionStatusBanner";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const { unreadCount } = usePriceAlerts();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gradient-primary" />
      </div>
    );
  }

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PaymentTestModeBanner />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/app" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
              <Wallet className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-base font-bold">SubTrack</span>
            {isPremium && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-gradient-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-elegant">
                <Crown className="h-2.5 w-2.5" /> Pro
              </span>
            )}
          </Link>
          <div className="flex items-center gap-1">
            {isPremium && (
              <>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" aria-label="Knowledge Vault">
                  <Link to="/app/vault">
                    <HardDrive className="h-4 w-4" />
                    <span className="ml-1.5 hidden lg:inline">Vault</span>
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground" aria-label="Price alerts">
                <Link to="/app/alerts">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
            </>
          )}
          {!isPremium && (
              <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary">
                <Link to="/pricing">
                  <Crown className="h-4 w-4" />
                  <span className="ml-1.5 hidden sm:inline">Upgrade</span>
                </Link>
              </Button>
            )}
            <ManageBillingMenu />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
              <LogOut className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>
      <SubscriptionStatusBanner />
      <Outlet />
    </div>
  );
}
