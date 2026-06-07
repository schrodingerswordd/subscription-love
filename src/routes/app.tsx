import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/hooks/useSubscription";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Crown, Bell, Library } from "lucide-react";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { SubscriptionStatusBanner } from "@/components/SubscriptionStatusBanner";
import { toast } from "sonner";
import { BunkerWrapper } from "@/components/vault/BunkerWrapper";

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
      <BunkerWrapper className="flex items-center justify-center">
        <div className="h-12 w-12 animate-spin border-4 border-primary border-t-transparent rounded-full" />
      </BunkerWrapper>
    );
  }

  async function handleSignOut() {
    await signOut();
    toast.success("SESSION TERMINATED");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary selection:text-primary-foreground">
      <PaymentTestModeBanner />
      <header className="sticky top-0 z-30 border-b border-primary/20 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/app" className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary bunker-glow" />
            <span className="text-lg font-black uppercase tracking-tighter text-primary">Vault Hub</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="text-primary/60 hover:text-primary hover:bg-primary/5 uppercase text-[10px] font-bold tracking-widest">
              <Link to="/app">
                <Library className="h-4 w-4 mr-2" /> Library
              </Link>
            </Button>
            
            {isPremium && (
              <Button asChild variant="ghost" size="sm" className="relative text-primary/60 hover:text-primary hover:bg-primary/5 uppercase text-[10px] font-bold tracking-widest">
                <Link to="/app/alerts">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            
            <div className="h-6 w-px bg-primary/20" />
            
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 uppercase text-[10px] font-bold tracking-widest">
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <SubscriptionStatusBanner />
      <BunkerWrapper>
        <Outlet />
      </BunkerWrapper>
    </div>
  );
}
