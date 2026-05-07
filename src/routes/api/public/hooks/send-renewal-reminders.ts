import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/brevo";
const SENDER_EMAIL = "xoxoanniee@email.cz";
const SENDER_NAME = "Joy Bills";
const REMINDER_DAYS = [7, 3, 1];

type Sub = {
  id: string;
  user_id: string;
  name: string;
  cost: number;
  billing_cycle: string;
  next_billing_date: string;
  category: string;
};

async function sendBrevo(toEmail: string, toName: string | null, subject: string, html: string) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not configured");

  const res = await fetch(`${GATEWAY_URL}/smtp/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: toEmail, name: toName ?? undefined }],
      subject,
      htmlContent: html,
    }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Brevo send failed [${res.status}]: ${body}`);
  return body;
}

function renderEmail(subs: Array<{ sub: Sub; daysUntil: number }>) {
  const rows = subs
    .map(
      ({ sub, daysUntil }) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">${escapeHtml(sub.name)}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">$${Number(sub.cost).toFixed(2)} / ${escapeHtml(sub.billing_cycle)}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">${sub.next_billing_date}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">${daysUntil === 0 ? "today" : `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a;">
      <h1 style="font-size:22px;margin:0 0 12px;">Upcoming subscription renewals</h1>
      <p style="font-size:14px;color:#555;margin:0 0 20px;">Heads up — these subscriptions will renew soon:</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="text-align:left;color:#888;">
            <th style="padding:8px;border-bottom:1px solid #ddd;">Name</th>
            <th style="padding:8px;border-bottom:1px solid #ddd;">Cost</th>
            <th style="padding:8px;border-bottom:1px solid #ddd;">Billing date</th>
            <th style="padding:8px;border-bottom:1px solid #ddd;">When</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:12px;color:#999;margin-top:24px;">You're receiving this from Joy Bills because you have an account with renewal alerts enabled.</p>
    </div>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export const Route = createFileRoute("/api/public/hooks/send-renewal-reminders")({
  server: {
    handlers: {
      POST: async () => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return new Response(JSON.stringify({ error: "Supabase env not configured" }), { status: 500 });
        }
        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const targets = REMINDER_DAYS.map((d) => {
          const date = new Date(today);
          date.setUTCDate(date.getUTCDate() + d);
          return { days: d, dateStr: date.toISOString().slice(0, 10) };
        });
        const dateStrings = targets.map((t) => t.dateStr);

        const { data: subs, error: subsErr } = await supabase
          .from("subscriptions")
          .select("id,user_id,name,cost,billing_cycle,next_billing_date,category")
          .eq("status", "active")
          .eq("alerts_enabled", true)
          .in("next_billing_date", dateStrings);

        if (subsErr) {
          return new Response(JSON.stringify({ error: subsErr.message }), { status: 500 });
        }
        if (!subs || subs.length === 0) {
          return new Response(JSON.stringify({ ok: true, processed: 0 }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        // Filter out already-sent
        const { data: alreadySent } = await supabase
          .from("reminder_sends")
          .select("subscription_id,billing_date")
          .in(
            "subscription_id",
            subs.map((s) => s.id)
          )
          .in("billing_date", dateStrings);

        const sentKey = new Set((alreadySent ?? []).map((r) => `${r.subscription_id}|${r.billing_date}`));
        const pending = (subs as Sub[]).filter((s) => !sentKey.has(`${s.id}|${s.next_billing_date}`));

        // Group by user
        const byUser = new Map<string, Sub[]>();
        for (const s of pending) {
          const arr = byUser.get(s.user_id) ?? [];
          arr.push(s);
          byUser.set(s.user_id, arr);
        }

        let emailed = 0;
        const errors: string[] = [];

        for (const [userId, userSubs] of byUser) {
          const { data: userResp, error: userErr } = await supabase.auth.admin.getUserById(userId);
          if (userErr || !userResp?.user?.email) {
            errors.push(`user ${userId}: no email`);
            continue;
          }
          const email = userResp.user.email;
          const displayName =
            (userResp.user.user_metadata?.full_name as string | undefined) ??
            (userResp.user.user_metadata?.name as string | undefined) ??
            null;

          const enriched = userSubs.map((sub) => {
            const billing = new Date(`${sub.next_billing_date}T00:00:00Z`);
            const daysUntil = Math.round((billing.getTime() - today.getTime()) / 86400000);
            return { sub, daysUntil };
          });
          enriched.sort((a, b) => a.daysUntil - b.daysUntil);

          const subject =
            enriched.length === 1
              ? `${enriched[0].sub.name} renews ${enriched[0].daysUntil === 0 ? "today" : `in ${enriched[0].daysUntil} day${enriched[0].daysUntil === 1 ? "" : "s"}`}`
              : `${enriched.length} subscriptions renewing soon`;

          try {
            await sendBrevo(email, displayName, subject, renderEmail(enriched));
            emailed++;

            await supabase.from("reminder_sends").insert(
              userSubs.map((s) => ({
                subscription_id: s.id,
                user_id: s.user_id,
                billing_date: s.next_billing_date,
              }))
            );
          } catch (e) {
            errors.push(`user ${userId}: ${(e as Error).message}`);
          }
        }

        return new Response(
          JSON.stringify({ ok: true, candidates: subs.length, emailed, errors }),
          { headers: { "Content-Type": "application/json" } }
        );
      },
    },
  },
});
