import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { transformInstagramMetaData } from "@/lib/utils";

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
    
    // Get the page name from Facebook pages
    const { data: pages, error: pagesError } = await supabase
      .from("facebook_pages")
      .select("page_name")
      .eq("user_id", user.id)
      .eq("page_id", pageId);
    
    const pageName = pages?.[0]?.page_name || "Instagram Business";
    
    console.log("🔍 FULL DEBUG: Complete Instagram data pipeline");
    console.log("🔍 User ID:", user.id);
    console.log("🔍 Page ID:", pageId);
    console.log("🔍 Page Name:", pageName);

    // Fetch conversations with enhanced participant fields
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

    // Get messages for each conversation
    const conversationsWithMessages = [];
    
    for (const conversation of conversationsData.data.slice(0, 2)) {
      console.log(`🔍 Processing conversation: ${conversation.id}`);
      
      const messagesUrl = `https://graph.facebook.com/v19.0/${conversation.id}/messages?fields=id,message,from{id,name,username},created_time&limit=3&access_token=${pageAccessToken}`;
      
      const messagesRes = await fetch(messagesUrl);
      const messagesData = await messagesRes.json();
      
      if (!messagesData.error) {
        conversationsWithMessages.push({
          ...conversation,
          messages: messagesData.data || []
        });
      }
    }

    // Transform the data using Instagram Business Account ID
    const transformed = transformInstagramMetaData(conversationsWithMessages, external_account_id);

    return new Response(
      JSON.stringify({
        success: true,
        debug: "Complete Instagram data pipeline",
        steps: {
          "1_user_info": {
            user_id: user.id,
            page_id: pageId,
            instagram_business_account_id: external_account_id,
            page_name: pageName
          },
          "2_raw_conversations": conversationsData,
          "3_conversations_with_messages": conversationsWithMessages,
          "4_transformed_data": transformed
        },
        final_result: {
          page_name: pageName,
          conversations: transformed
        }
      }),
      { status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: true,
        message: err?.message || "Full debug API error",
        details: err,
      }),
      { status: 500 }
    );
  }
}
