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
    const { message, recipientId, threadId } = await req.json();

    if (!message || !recipientId) {
      return new Response(
        JSON.stringify({
          error: "Message and recipient ID are required.",
        }),
        { status: 400 }
      );
    }

    // Note: Instagram Basic Display API doesn't support sending messages
    // This requires Instagram Messaging API with proper business verification
    
    // For now, return a placeholder response
    return new Response(
      JSON.stringify({
        success: false,
        message: "Instagram messaging requires Instagram Messaging API access and business verification.",
        note: "Instagram Basic Display API doesn't support sending messages.",
        placeholder: true,
        data: {
          message,
          recipientId,
          threadId,
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
            id: recipientId,
          },
          message: {
            text: message,
          },
          access_token: accessToken,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.message_id,
        timestamp: new Date().toISOString(),
      }),
      { status: 200 }
    );
    */

  } catch (err: any) {
    console.error("Instagram send message error:", err);
    return new Response(
      JSON.stringify({
        error: true,
        message: err?.error?.message || "Failed to send Instagram message.",
        details: err,
      }),
      { status: 500 }
    );
  }
}
