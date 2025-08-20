import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    // Get the user's Instagram integration
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "instagram")
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ error: "No Instagram integration found for this user." }),
        { status: 400 }
      );
    }

    const { access_token, external_account_id, metadata } = integration;
    const pageId = metadata?.page_id;
    const pageAccessToken = metadata?.page_access_token || access_token;
    
    console.log("🔍 Debug: Enhanced participant fields test");
    console.log("🔍 Page ID:", pageId);

    // Test enhanced participants API call
    const conversationsUrl = `https://graph.facebook.com/v19.0/${pageId}/conversations?platform=instagram&fields=id,participants{id,name,username,picture},updated_time&limit=2&access_token=${pageAccessToken}`;
    
    const conversationsRes = await fetch(conversationsUrl);
    const conversationsData = await conversationsRes.json();

    if (conversationsData.error) {
      return new Response(
        JSON.stringify({
          error: true,
          message: conversationsData.error.message,
          details: conversationsData.error,
        }),
        { status: 500 }
      );
    }

    // Test enhanced messages API call for first conversation
    let messagesData = null;
    if (conversationsData.data && conversationsData.data.length > 0) {
      const firstConversationId = conversationsData.data[0].id;
      
      const messagesUrl = `https://graph.facebook.com/v19.0/${firstConversationId}/messages?fields=id,message,from{id,name,username},created_time&limit=5&access_token=${pageAccessToken}`;
      
      const messagesRes = await fetch(messagesUrl);
      messagesData = await messagesRes.json();
    }

    return new Response(
      JSON.stringify({
        success: true,
        debug: "Enhanced participant and message data test",
        pageId: pageId,
        conversations: conversationsData,
        sampleMessages: messagesData,
      }),
      { status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: true,
        message: err?.message || "Debug API error",
        details: err,
      }),
      { status: 500 }
    );
  }
}
