// /app/api/messenger/mark-as-seen/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 🔐 Get current Supabase user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { data: tokenData, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "facebook")
    .single();

  if (error || !tokenData) {
    return new Response(
      JSON.stringify({
        error: "No Facebook token found. Please connect Messenger.",
      }),
      { status: 401 }
    );
  }

  const { data: pageData, error: pageError } = await supabase
    .from("facebook_pages")
    .select("*")
    .eq("integration_id", tokenData.id) // взимаме страницата свързана с integration
    .single();

  if (pageError || !pageData) {
    return new Response(
      JSON.stringify({
        error:
          "No Facebook page found. Please reconnect your Facebook account.",
      }),
      { status: 400 }
    );
  }

  const pageId = pageData.page_id;
  const accessToken = pageData.access_token;

  if (!accessToken || !pageId) {
    return new Response(
      JSON.stringify({
        error: "Missing page access token or page ID.",
      }),
      { status: 400 }
    );
  }

  try {
    const { senderId } = await req.json();

    const res = await fetch("https://graph.facebook.com/v19.0/me/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: senderId },
        sender_action: "mark_seen",
        access_token: accessToken,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      return new Response(error, { status: res.status });
    }

    return new Response(JSON.stringify({ message: "Marked as seen" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Mark seen error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
