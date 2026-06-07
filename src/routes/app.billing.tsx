import { createFileRoute } from "@tanstack/react-router";
import { VaultBilling } from "@/components/vault/VaultBilling";

export const Route = createFileRoute("/app/billing")({
  component: BillingHistoryPage,
  head: () => ({ meta: [{ title: "Requisition Logs — The Knowledge Vault" }] }),
});

function BillingHistoryPage() {
  return <VaultBilling />;
}
