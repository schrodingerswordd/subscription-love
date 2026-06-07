import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { signupSchema } from "@/lib/auth-schemas";
import { toast } from "sonner";
import { BunkerWrapper } from "./BunkerWrapper";
import { SchrodingerMark } from "./SchrodingerMark";

export const VaultSignup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error("Security protocol failed: Invalid input format");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin + "/app" : undefined,
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("IDENTITY RECORDED. PROCEED TO VERIFICATION.");
    navigate({ to: "/app" });
  }

  return (
    <BunkerWrapper className="flex items-center justify-center" variant="amber">
      <div className="w-full max-w-md p-8 border bunker-border-glow bg-card/80 backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 mb-4">
            <SchrodingerMark size={64} state="alive" className="bunker-glow" title="Schrödinger's Archive — Identity Online" />
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-primary bunker-glow uppercase text-center">
            Register Clearance
          </h1>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mt-2">
            Establish Identity Record
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase tracking-wider">Designated Email</Label>
            <Input
              id="email"
              type="email"
              className="bg-black/40 border-primary/30 focus:border-primary rounded-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@vault.int"
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs uppercase tracking-wider">Establish Secure Passcode</Label>
            <Input
              id="password"
              type="password"
              className="bg-black/40 border-primary/30 focus:border-primary rounded-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Minimum 8 characters. Must contain alpha-numeric elements.</p>
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 font-bold uppercase tracking-[0.3em] transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Initialize Enrollment"
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-primary/10 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Already established?{" "}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Access Vault
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-[10px] text-primary/40 font-mono text-center uppercase tracking-tighter">
          Identity Services Online // Encryption: AES-256-BUNKER
        </div>
      </div>
    </BunkerWrapper>
  );
};
