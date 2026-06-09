/**
 * Email Integration Test Script
 * Schrödinger's Archive — The Knowledge Vault
 * 
 * Usage: npx tsx test-email.ts <to_email> <subject> <body>
 * 
 * Requires environment variables:
 * - RESEND_API_KEY: Your Resend API key
 * - EMAIL_FROM: Verified sender email (default: vault@schrodingersarchive.com)
 */

import { sendTextEmail, sendHtmlEmail } from './mail-provider';

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log('Usage: npx tsx test-email.ts <to> <subject> <body>');
    process.exit(1);
  }

  const [to, subject, body] = args;
  
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  const result = await sendTextEmail(to, subject, body);
  
  if (result.success) {
    console.log(`✅ Email sent successfully! Message ID: ${result.messageId}`);
  } else {
    console.error(`❌ Failed to send email: ${result.error}`);
    process.exit(1);
  }
}

main();
