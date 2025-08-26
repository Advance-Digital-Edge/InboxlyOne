// utils/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWelcome(to: string) {
  return resend.emails.send({
    from: "Inboxlyone <onboarding@resend.dev>", // must be verified
    to,
    subject: "Welcome to Inboxlyone 🎉",
    html: `
     <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:600px;margin:auto;background:#f9fafb;padding:24px;border-radius:12px;color:#111">
  <div style="text-align:center;margin-bottom:24px;">
    <h1 style="margin:0;font-size:24px;color:#4f46e5;">Welcome to Inboxlyone 🎉</h1>
  </div>

  <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">
    Hey there,
  </p>
  <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">
    You’re officially on the waitlist 🚀 Thanks for joining Inboxlyone.
  </p>
  <p style="font-size:16px;line-height:1.5;margin:0 0 24px;">
    We’ll keep you posted as soon as early access opens. You’ll be among the first to try it out.
  </p>

  <div style="text-align:center;margin:32px 0;">
    <a href="https://inboxlyone.com" style="background:linear-gradient(to right,#4f46e5,#9333ea);color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;display:inline-block;">
      Visit Inboxlyone
    </a>
  </div>

  <p style="font-size:14px;color:#555;margin-top:32px;">
    — The Inboxlyone Team
  </p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
  <p style="font-size:12px;color:#888;margin:0;">
    You received this email because you joined the Inboxlyone waitlist.
  </p>
</div>

    `,
    text:
      `You’re officially in.\n\n` +
      `Thanks for joining the Inboxlyone waitlist.\n` +
      `We’ll email you as soon as early access opens.\n\n` +
      `— Team Inboxlyone`,
  });
}
