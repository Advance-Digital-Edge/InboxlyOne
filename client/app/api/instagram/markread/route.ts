import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
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

  try {
    const { senderId, conversationId } = await req.json();

    console.log("📱 Instagram mark as read request:", { senderId, conversationId });

    if (!senderId && !conversationId) {
      return new Response(
        JSON.stringify({
          error: "Sender ID or conversation ID is required.",
        }),
        { status: 400 }
      );
    }

    // 1️⃣ Get the user's Facebook integration (same as Messenger)
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "facebook") // Use Facebook integration, not Instagram
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "No Facebook integration found for this user." }),
        { status: 400 }
      );
    }

    // 2️⃣ Get the Facebook page data (which has Instagram connected)
    const { data: pageData, error: pageError } = await supabase
      .from("facebook_pages")
      .select("*")
      .eq("integration_id", integration.id) // Get page connected to this integration
      .single();

    if (pageError || !pageData) {
      return new Response(
        JSON.stringify({
          error: "No Facebook page found. Please reconnect your Facebook account.",
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

    console.log("📱 Using Facebook Page for Instagram mark read:", pageId);

    // 3️⃣ Mark as read via Facebook Pages API (same as Messenger)
    const response = await fetch("https://graph.facebook.com/v19.0/me/messages", {
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

    console.log("📱 Instagram mark read response:", {
      status: response.status
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Instagram mark read failed:", error);
      return new Response(error, { status: response.status });
    }

    console.log("✅ Instagram conversation marked as read via Facebook Pages API");

    return new Response(JSON.stringify({ message: "Marked as seen" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("❌ Instagram mark read error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
