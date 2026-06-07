import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { VaultLogin } from "@/components/vault/VaultLogin";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Vault Access — The Knowledge Vault" },
      { name: "description", content: "Access the Knowledge Vault - Secure Survival Archive." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) navigate({ to: "/app" });
  }, [user, authLoading, navigate]);

  return <VaultLogin />;
}
