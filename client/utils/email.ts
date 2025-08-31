import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendWelcome(to: string) {
  return resend.emails.send({
    from: "Inboxlyone Team <team@inboxly.one>",
    to,
    subject: "Welcome aboard ",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
                  max-width:640px;
                  margin:auto;
                  background:#ffffff;
                  padding:40px 32px;
                  border-radius:16px;
                  color:#111;
                  line-height:1.5;">

        <!-- Header -->
        <h1 style="margin:0 0 24px 0;
                   font-size:24px;
                   font-weight:700;
                   text-align:left;
                   color:#111;">
          Welcome to Inboxlyone 
        </h1>

        <!-- Body -->
        <p style="font-size:16px;margin:0 0 16px 0;color:#111;">
          Thanks for joining us early! We're building <strong>Inboxlyone</strong> to help you stay on top of conversations without the stress or chaos of jumping between multiple apps.
        </p>

        <p style="font-size:16px;margin:0 0 16px 0;color:#111;">
          Our mission is simple: <strong>one calm inbox, everything in one place.</strong>
        </p>

        <p style="font-size:16px;margin:0 0 24px 0;color:#111;">
          You’re now part of the early crew, and we couldn’t be more excited to have you on board.
        </p>

  

        <!-- Closing -->
        <p style="font-size:15px;margin:32px 0 0 0;color:#333;text-align:left;">
          Talk soon, <br/><br/>
          Ayti & Gem <br/>
          <span style="color:#4f46e5;font-weight:500;">Founders @ Inboxlyone</span>
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:40px 0;">

        <!-- Footer -->
        <p style="font-size:12px;color:#888;margin:0;text-align:center;">
          You’re receiving this because you joined the Inboxlyone waitlist.  
          <br/>
          <a href="https://inboxly.one/unsubscribe" style="color:#888;text-decoration:underline;">Unsubscribe</a> anytime.
        </p>
      </div>
    `,
    text: 
      `Welcome to Inboxlyone 👋\n\n` +
      `Thanks for joining us early! We're building Inboxlyone to help you stay on top of conversations without the stress or chaos of multiple apps.\n\n` +
      `Our mission: one calm inbox, everything in one place.\n\n` +
      `You’re now part of the early crew, and we couldn’t be more excited.\n\n` +
      `See what’s next: https://inboxly.one/welcome\n\n` +
      `Talk soon,\nAyti & Gem\nFounders @ Inboxlyone\n\n` +
      `—\nYou’re receiving this because you joined the Inboxlyone waitlist.\nUnsubscribe here: https://inboxly.one/unsubscribe`
  });
}
