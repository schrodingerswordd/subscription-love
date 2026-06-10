/**
 * Email Service Integration
 * Schrödinger's Archive — The Knowledge Vault
 * 
 * This module provides a unified email sending interface.
 * Currently configured for Resend (API key via MCP).
 * 
 * Required environment variables (set via MCP or .env):
 * - RESEND_API_KEY: Resend API key
 * - EMAIL_FROM: Verified sender (e.g., vault@schrodingersarchive.com)
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email via Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const { to, subject, text, html, from } = options;
  
  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = from || process.env.EMAIL_FROM || 'vault@schrodingersarchive.com';
  
  if (!apiKey) {
    return {
      success: false,
      error: 'RESEND_API_KEY not configured. Please set via MCP or environment.'
    };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: senderEmail,
        to: recipients,
        subject,
        text,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Resend API error: ${error}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send a simple text email
 */
export async function sendTextEmail(
  to: string | string[],
  subject: string,
  body: string
): Promise<EmailResult> {
  return sendEmail({ to, subject, text: body });
}

/**
 * Send an HTML email
 */
export async function sendHtmlEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<EmailResult> {
  return sendEmail({ to, subject, html });
}

// Re-export types
export type { EmailOptions, EmailResult };
