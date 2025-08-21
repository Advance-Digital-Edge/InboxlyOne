// app/api/test-instagram/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // 🔐 Get current Supabase user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized - please sign in first" }), {
      status: 401,
    });
  }

  try {
    // 1️⃣ Get the user's Instagram integration
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "instagram")
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ 
          error: "No Instagram integration found",
          user_id: user.id,
          debug: "Check user_integrations table"
        }),
        { status: 400 }
      );
    }

    const { access_token, external_account_id, metadata } = integration;
    const pageId = metadata?.page_id;
    const pageAccessToken = metadata?.page_access_token || access_token;
    
    // Test: Get one conversation with minimal details to avoid timeout
    const conversationsUrl = `https://graph.facebook.com/v19.0/${pageId}/conversations?platform=instagram&fields=id,participants,updated_time&limit=1&access_token=${pageAccessToken}`;
    const conversationsRes = await fetch(conversationsUrl);
    const conversationsData = await conversationsRes.json();

    if (conversationsData.error) {
      return new Response(
        JSON.stringify({
          error: conversationsData.error,
          debug: "Failed to fetch conversations"
        }),
        { status: 500 }
      );
    }

    let messagesSample = null;
    if (conversationsData.data && conversationsData.data.length > 0) {
      const firstConvId = conversationsData.data[0].id;
      const messagesUrl = `https://graph.facebook.com/v19.0/${firstConvId}/messages?fields=id,message,from,created_time&limit=2&access_token=${pageAccessToken}`;
      const messagesRes = await fetch(messagesUrl);
      messagesSample = await messagesRes.json();
    }

    return new Response(
      JSON.stringify({
        success: true,
        integration: {
          user_id: user.id,
          page_id: pageId,
          instagram_account_id: external_account_id
        },
        conversations_sample: conversationsData,
        messages_sample: messagesSample,
        debug: "Full Instagram API response structure"
      }),
      { status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: true,
        message: err?.message || "Unexpected error",
        details: err,
      }),
      { status: 500 }
    );
  }
}
