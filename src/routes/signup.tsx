import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { VaultSignup } from "@/components/vault/VaultSignup";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Register Clearance — The Knowledge Vault" },
      { name: "description", content: "Establish your identity record for Vault Access." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/app" });
  }, [user, authLoading, navigate]);

  return <VaultSignup />;
}
