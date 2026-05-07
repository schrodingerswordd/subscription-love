import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Subtrack" },
      { name: "description", content: "Terms governing the use of Subtrack." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <span className="text-sm font-semibold">Terms of Service</span>
          <span className="w-16" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 prose prose-sm dark:prose-invert">
        <h1>Terms of Service</h1>
        <p><em>Last updated: May 2026</em></p>

        <h2>1. Who you are contracting with</h2>
        <p>These Terms form an agreement between you and <strong>Subtrack</strong> ("Subtrack", "we", "us"), the operator of the Subtrack subscription tracking service (the "Service"). By creating an account or using the Service, you agree to these Terms. If you are using the Service on behalf of an organisation, you confirm that you have authority to bind that organisation. If you are an individual, you confirm that you are of legal age in your jurisdiction.</p>

        <h2>2. The Service</h2>
        <p>Subtrack lets you record your recurring subscriptions, see your total recurring spend, receive renewal reminders, and (on paid plans) access additional features such as bank statement scanning and price-change alerts.</p>

        <h2>3. Acceptable use</h2>
        <p>You must not misuse the Service, including by: using it for any unlawful purpose; attempting fraud, spam, or abuse; infringing any third party's intellectual property; or interfering with the Service's security (including malware, probing, scraping, or circumventing technical limits). You must keep your account credentials confidential and are responsible for activity under your account. You agree to provide accurate information and keep it updated.</p>

        <h2>4. Intellectual property</h2>
        <p>Subtrack and its underlying software, design, and branding are owned by Subtrack and protected by intellectual property laws. We grant you a limited, non-exclusive, non-transferable right to use the Service in accordance with your selected plan. You may not reverse engineer, resell, or redistribute the Service. Content you enter remains yours; you grant us a limited licence to host and process it solely to provide the Service.</p>

        <h2>5. Payments and subscriptions</h2>
        <p>Our order process is conducted by our online reseller <strong>Paddle.com</strong>. <strong>Paddle.com is the Merchant of Record for all our orders.</strong> Paddle provides all customer service inquiries and handles returns. Payment, billing, taxes, renewal, cancellation, and refund mechanics for paid plans are governed by Paddle's <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer">Buyer Terms</a>, which form part of your purchase. Paid plans renew automatically until cancelled. You can cancel at any time through paddle.net or from within the Service.</p>

        <h2>6. Refunds</h2>
        <p>We offer a <strong>30-day money-back guarantee</strong>. If you are not satisfied with a paid plan, you may request a full refund within 30 days of your purchase date. Refunds are processed by Paddle. To request a refund, visit <a href="https://paddle.net" target="_blank" rel="noopener noreferrer">paddle.net</a> or contact our support team.</p>

        <h2>7. Service level and warranties</h2>
        <p>We work to keep the Service available and accurate, but we do not guarantee that it will be uninterrupted or error-free. To the fullest extent permitted by law, we disclaim all implied warranties, including merchantability and fitness for a particular purpose. Subtrack is a tracking tool — it is not financial, tax, or investment advice.</p>

        <h2>8. Liability</h2>
        <p>To the fullest extent permitted by law, our aggregate liability arising out of or in connection with the Service is capped at the fees you paid to us in the twelve months before the event giving rise to the claim. We are not liable for indirect, consequential, or special damages, including loss of profits, data, or goodwill. Nothing in these Terms excludes liability that cannot be excluded by law (such as for fraud, death, or personal injury caused by negligence).</p>

        <h2>9. Suspension and termination</h2>
        <p>We may suspend or terminate your access to the Service if you materially breach these Terms, fail to pay, create a security or fraud risk, or repeatedly or seriously violate our policies. You may stop using the Service and delete your account at any time. On termination, your right to use the Service ends and we may delete your data after a reasonable period.</p>

        <h2>10. Indemnity</h2>
        <p>You agree to indemnify Subtrack against claims arising out of your content, your unlawful use of the Service, or your violation of these Terms.</p>

        <h2>11. Changes</h2>
        <p>We may update these Terms from time to time. Material changes will be communicated through the Service. Continued use after changes take effect constitutes acceptance.</p>

        <h2>12. Governing law and disputes</h2>
        <p>These Terms are governed by the laws of the seller's jurisdiction, and the courts of that jurisdiction have exclusive jurisdiction over any disputes, except where mandatory consumer law in your country of residence provides otherwise.</p>

        <h2>13. Assignment and force majeure</h2>
        <p>You may not assign these Terms without our consent. We may assign them in connection with a merger, acquisition, or sale of assets. Neither party is liable for delays or failures caused by events beyond reasonable control.</p>

        <h2>14. Contact</h2>
        <p>Questions about these Terms? Reach Subtrack through the support channel inside the app.</p>
      </main>
    </div>
  );
}
