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

  const { data: tokenData, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "instagram")
    .single();

  if (error || !tokenData) {
    return new Response(
      JSON.stringify({
        error: "No Instagram token found. Please connect Instagram.",
      }),
      { status: 401 }
    );
  }

  const accessToken = tokenData.access_token;
  const igUserId = tokenData.external_account_id;

  if (!accessToken || !igUserId) {
    return new Response(
      JSON.stringify({
        error: "Missing Instagram access token or user ID.",
      }),
      { status: 400 }
    );
  }

  try {
    const { threadId, messageId } = await req.json();

    if (!threadId) {
      return new Response(
        JSON.stringify({
          error: "Thread ID is required.",
        }),
        { status: 400 }
      );
    }

    // Note: Instagram Basic Display API doesn't support marking messages as read
    // This requires Instagram Messaging API with proper business verification
    
    // For now, return a placeholder response
    return new Response(
      JSON.stringify({
        success: false,
        message: "Instagram read receipts require Instagram Messaging API access.",
        note: "Instagram Basic Display API doesn't support message read status.",
        placeholder: true,
        data: {
          threadId,
          messageId,
          timestamp: new Date().toISOString(),
        }
      }),
      { status: 200 }
    );

    // When you have Instagram Messaging API access, you would use:
    /*
    const response = await fetch(
      `https://graph.instagram.com/v17.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: {
            thread_key: threadId,
          },
          sender_action: "mark_seen",
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    return new Response(
      JSON.stringify({
        success: true,
        threadId,
        messageId,
        timestamp: new Date().toISOString(),
      }),
      { status: 200 }
    );
    */

  } catch (err: any) {
    console.error("Instagram mark read error:", err);
    return new Response(
      JSON.stringify({
        error: true,
        message: err?.error?.message || "Failed to mark Instagram message as read.",
        details: err,
      }),
      { status: 500 }
    );
  }
}
