// app/api/subscribe/route.ts
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendWelcome } from "@/utils/email";

const BodySchema = z.object({
  email: z.string().email(),
  source: z.string().optional(), // e.g. "hero", "footer"
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
    if (!parsed.success)
      return json({ ok: false, error: "Invalid email." }, 400);

    // normalize email
    const email = parsed.data.email.trim().toLowerCase();
    const source = parsed.data.source;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
    );

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

    // Fire-and-forget welcome (don’t block success if email fails)
    try {
      const result = await sendWelcome(email);
      console.log("Welcome email result:", result);
    } catch (e) {
      console.error("Welcome send fail:", e);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error("subscribe route error:", err);
    return json({ ok: false, error: "Server error." }, 500);
  }
}
