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
    const { message, recipientId, senderId, threadId } = await req.json();

    // Accept either recipientId or senderId for backwards compatibility
    const targetUserId = recipientId || senderId;

    console.log("📱 Instagram send message request:", { 
      message, 
      recipientId, 
      senderId, 
      targetUserId, 
      threadId 
    });

    if (!message || !targetUserId) {
      return new Response(
        JSON.stringify({
          error: "Message and recipient ID (or sender ID) are required.",
        }),
        { status: 400 }
      );
    }

    // 1️⃣ Get the user's Instagram integration (via Facebook integration)
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

    console.log("📱 Using Facebook Page:", pageId);

    // 3️⃣ Send message via Facebook Pages API (same as Messenger)
    // This works because Instagram Business accounts are connected to Facebook Pages
    const sendMessageUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${accessToken}`;
    
    const messagePayload = {
      recipient: { id: targetUserId },
      message: { text: message },
    };

    console.log("📱 Sending Instagram message via Facebook Pages API:", {
      url: sendMessageUrl.replace(accessToken, "***TOKEN***"),
      payload: messagePayload
    });

    const response = await fetch(sendMessageUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messagePayload),
    });

    const result = await response.json();

    console.log("📱 Instagram send message response:", {
      status: response.status,
      result: result
    });

    if (!response.ok) {
      console.error("❌ Instagram send message failed:", result);
      return new Response(JSON.stringify({ error: result }), {
        status: response.status,
      });
    }

    console.log("✅ Instagram message sent successfully via Facebook Pages API");

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err: any) {
    console.error("❌ Instagram send message error:", err);
    return new Response(
      JSON.stringify({
        error: true,
        message: err?.message || "Failed to send Instagram message.",
        details: err,
      }),
      { status: 500 }
    );
  }
}
