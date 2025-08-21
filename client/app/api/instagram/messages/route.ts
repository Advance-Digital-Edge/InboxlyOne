// app/api/instagram/messages/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { transformInstagramMetaData } from "@/lib/utils";

export async function GET(req: NextRequest) {
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
    // 1️⃣ Get the user's Instagram integration
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
    
    // Get Instagram account details from instagram_accounts table
    const { data: instagramAccount, error: igError } = await supabase
      .from("instagram_accounts")
      .select("username, profile_picture")
      .eq("instagram_id", external_account_id)
      .single();

    const instagramUsername = instagramAccount?.username || "Instagram Business";
    const instagramAvatar = instagramAccount?.profile_picture || "";
    
    console.log("📱 Fetching Instagram conversations...");
    console.log("📱 Instagram Business Account ID:", external_account_id);
    console.log("📱 Instagram Username:", instagramUsername);
    console.log("📱 Instagram Avatar:", instagramAvatar);
    console.log("📱 Facebook Page ID:", pageId);

    // 2️⃣ Fetch Instagram conversations directly from Meta Graph API
    // Using Page-level conversations with Instagram platform filter (enhanced participant fields)
    const conversationsUrl = `https://graph.facebook.com/v19.0/${pageId}/conversations?platform=instagram&fields=id,participants{id,name,username,picture},updated_time&access_token=${pageAccessToken}`;
    
    console.log("📱 Instagram Conversations URL:", conversationsUrl.replace(pageAccessToken, "***TOKEN***"));

    const conversationsRes = await fetch(conversationsUrl);
    const conversationsData = await conversationsRes.json();

    console.log("📱 Instagram Conversations response:", JSON.stringify(conversationsData, null, 2));

    if (conversationsData.error) {
      console.error("❌ Instagram conversations API error:", conversationsData.error);
      return new Response(
        JSON.stringify({
          error: true,
          message: conversationsData.error.message || "Failed to fetch Instagram conversations.",
          details: conversationsData.error,
        }),
        { status: 500 }
      );
    }

    if (!conversationsData.data || conversationsData.data.length === 0) {
      console.log("📱 No Instagram conversations found");
      return new Response(
        JSON.stringify({
          success: true,
          conversations: [],
          note: "No Instagram conversations found. Make sure you have Instagram DMs with app testers."
        }),
        { status: 200 }
      );
    }

    console.log(`📱 Found ${conversationsData.data.length} Instagram conversations`);

    // 3️⃣ Get messages for each conversation (simplified to avoid timeouts)
    const conversationsWithMessages = [];
    
    // Process conversations sequentially to avoid rate limits
    for (const conversation of conversationsData.data.slice(0, 5)) { // Limit to first 5 conversations
      console.log(`📱 Fetching messages for Instagram conversation: ${conversation.id}`);
      
      try {
        // Enhanced message request to get sender names
        const messagesUrl = `https://graph.facebook.com/v19.0/${conversation.id}/messages?fields=id,message,from{id,name,username},created_time&limit=3&access_token=${pageAccessToken}`;
        
        const messagesRes = await fetch(messagesUrl);
        const messagesData = await messagesRes.json();
        
        if (messagesData.error) {
          console.error(`❌ Error fetching messages for ${conversation.id}:`, messagesData.error);
          conversationsWithMessages.push({
            ...conversation,
            messages: []
          });
        } else {
          conversationsWithMessages.push({
            ...conversation,
            messages: messagesData.data || []
          });
        }
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing conversation ${conversation.id}:`, error);
        conversationsWithMessages.push({
          ...conversation,
          messages: []
        });
      }
    }

    // 4️⃣ Transform data to match PlatformInbox format (following Messenger pattern)
    // Use Instagram Business Account ID for participant filtering, not Page ID
    const transformed = transformInstagramMetaData(conversationsWithMessages, external_account_id);
    
    console.log("📱 Using Instagram Business Account ID for filtering:", external_account_id);
    console.log("📱 Page ID (Facebook):", pageId);
    console.log("📱 Transformed Instagram conversations:", JSON.stringify(transformed, null, 2));

    // 5️⃣ Structure response like Messenger (with conversations array and Instagram username)
    return new Response(
      JSON.stringify({
        success: true,
        conversations: transformed,
        page_name: instagramUsername, // Use Instagram username for outgoing messages
        instagram_avatar: instagramAvatar, // Include Instagram profile picture
        debug: {
          raw_conversations_count: conversationsWithMessages.length,
          transformed_count: transformed.length,
          sample_conversation_ids: conversationsWithMessages.slice(0, 2).map(c => c.id),
          page_id: pageId,
          business_account_id: external_account_id
        },
        note: `Found ${conversationsWithMessages.length} Instagram conversations`
      }),
      { status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: true,
        message: err?.message || "Unexpected error while fetching Instagram conversations",
        details: err,
      }),
      { status: 500 }
    );
  }
}
