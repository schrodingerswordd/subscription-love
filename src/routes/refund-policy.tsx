import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Subtrack" },
      { name: "description", content: "Subtrack's 30-day money-back guarantee and how to request a refund." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <span className="text-sm font-semibold">Refund Policy</span>
          <span className="w-16" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 prose prose-sm dark:prose-invert">
        <h1>Refund Policy</h1>
        <p><em>Last updated: May 2026</em></p>

        <p><strong>Subtrack</strong> offers a <strong>30-day money-back guarantee</strong> on paid plans. If you are not satisfied with your purchase, you can request a full refund within 30 days of your order date.</p>

        <h2>How to request a refund</h2>
        <p>Refunds for Subtrack are processed by our payment provider, <strong>Paddle.com</strong>, which is the Merchant of Record for all our orders. To request a refund:</p>
        <ul>
          <li>Visit <a href="https://paddle.net" target="_blank" rel="noopener noreferrer">paddle.net</a> and look up your order using the email you used at checkout, or</li>
          <li>Contact Subtrack support through the support channel inside the app and we will help you process the refund through Paddle.</li>
        </ul>

        <p>Once approved, refunds are typically returned to your original payment method within 5–10 business days, depending on your bank or card issuer.</p>

        <p>For full payment, billing, and refund mechanics, see Paddle's <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noopener noreferrer">Refund Policy</a> and <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer">Buyer Terms</a>.</p>
      </main>
    </div>
  );
}
