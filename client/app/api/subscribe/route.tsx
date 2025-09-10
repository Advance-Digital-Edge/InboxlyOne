export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendWelcome } from "@/utils/email";

const BodySchema = z.object({
  email: z.string().email(),
  source: z.string().optional(), // e.g. "hero", "footer"
  company: z.string().optional(), // 👈 honeypot field
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const jsonBody = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(jsonBody);
    if (!parsed.success) {
      return json({ ok: false, error: "Invalid email." }, 400);
    }

    const { email: rawEmail, source, company } = parsed.data;

    // Honeypot trap — if bots fill this, reject silently
    if (company && company.trim() !== "") {
      console.warn("Spam detected, honeypot filled:", company);
      return json({ ok: true }, 200); // fake success, don’t give bots info
    }

    // Normalize email
    const email = rawEmail.trim().toLowerCase();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
    );

    // Insert into Supabase
    const { error } = await supabase
      .from("subscribers")
      .insert({ email, source });

    if (error) {
      if (error.code === "23505") {
        // unique_violation -> already subscribed
        return json({ ok: false, error: "You're already subscribed" }, 409);
      }
      console.error("subscribe insert error:", error);
      return json({ ok: false, error: "Database error." }, 500);
    }

    // Fire-and-forget welcome email
    try {
      sendWelcome(email).catch((e) =>
        console.error("Welcome send fail:", e)
      );
    } catch (e) {
      console.error("Welcome send fail:", e);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error("subscribe route error:", err);
    return json({ ok: false, error: "Server error." }, 500);
  }
}
