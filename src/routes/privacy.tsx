import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Subtrack" },
      { name: "description", content: "How Subtrack collects, uses, and protects your personal data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Back</Link>
          </Button>
          <span className="text-sm font-semibold">Privacy Notice</span>
          <span className="w-16" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 prose prose-sm dark:prose-invert">
        <h1>Privacy Notice</h1>
        <p><em>Last updated: May 2026</em></p>

        <p>This Privacy Notice describes how <strong>Subtrack</strong> ("Subtrack", "we", "us") collects, uses, and protects your personal data when you use our subscription tracking service (the "Service"). Subtrack acts as the data controller for the personal data described below.</p>

        <h2>1. Categories of personal data we collect</h2>
        <ul>
          <li><strong>Account data:</strong> email address, display name, hashed password or OAuth identifier.</li>
          <li><strong>Service data:</strong> the subscriptions, prices, billing dates, and notes you choose to enter.</li>
          <li><strong>Support data:</strong> messages you send us via support channels.</li>
          <li><strong>Usage and device data:</strong> IP address, browser type, device identifiers, log timestamps, and basic telemetry needed to operate and secure the Service.</li>
        </ul>

        <h2>2. Purposes and legal bases</h2>
        <ul>
          <li><strong>Provide the Service</strong> (contract performance): authenticate you, store your subscriptions, send renewal reminders.</li>
          <li><strong>Security and fraud prevention</strong> (legitimate interests): detect abuse, protect accounts.</li>
          <li><strong>Product improvement</strong> (legitimate interests): aggregate, anonymised analytics on feature usage.</li>
          <li><strong>Customer support</strong> (contract performance / legitimate interests): respond to your inquiries.</li>
          <li><strong>Legal compliance</strong> (legal obligation): respond to valid legal requests.</li>
        </ul>

        <h2>3. Data sharing</h2>
        <p>We share personal data only with:</p>
        <ul>
          <li><strong>Service providers / subprocessors</strong> — hosting, database, email delivery (Brevo), and analytics providers acting on our behalf.</li>
          <li><strong>Paddle.com Market Ltd ("Paddle")</strong> — our Merchant of Record. Paddle handles the sale of paid plans, subscription management, payments, tax compliance, refunds, and invoicing. Paddle acts as an independent controller for payment data it collects.</li>
          <li><strong>Professional advisers</strong> — legal, accounting, and similar advisers, where necessary.</li>
          <li><strong>Authorities</strong> — when required by law or to protect our rights.</li>
        </ul>
        <p>We do not sell your personal data.</p>

        <h2>4. Data retention</h2>
        <p>We keep account and service data for as long as your account is active. If you delete your account, we delete or anonymise your personal data within a reasonable period, except where we must retain certain records to meet legal, tax, or security obligations.</p>

        <h2>5. Your rights</h2>
        <p>Subject to applicable law, you may have the right to access, rectify, erase, restrict, or port your personal data, to object to certain processing, to withdraw consent, and to lodge a complaint with your local data protection authority. To exercise these rights, contact us through the support channel listed in the app. We aim to respond within one month.</p>

        <h2>6. International transfers</h2>
        <p>Your data may be processed in countries outside your own, including the United States and the European Union. Where required, we rely on appropriate safeguards such as Standard Contractual Clauses or adequacy decisions.</p>

        <h2>7. Security</h2>
        <p>We apply appropriate technical and organisational measures to protect your data, including encryption in transit, access controls, and isolated per-user data access policies. No system is perfectly secure; please use a strong, unique password.</p>

        <h2>8. Cookies</h2>
        <p>We use strictly necessary cookies and similar technologies to keep you logged in and to operate the Service. We may use limited analytics cookies to understand aggregate usage. You can control cookies through your browser settings.</p>

        <h2>9. Contact</h2>
        <p>For privacy questions, contact Subtrack through the support channel inside the app.</p>
      </main>
    </div>
  );
}
