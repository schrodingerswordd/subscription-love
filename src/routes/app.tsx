import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

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
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/app" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
              <Wallet className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-base font-bold">SubTrack</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
