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
    
    console.log("📱 Fetching Instagram conversations...");
    console.log("📱 Instagram Business Account ID:", external_account_id);
    console.log("📱 Facebook Page ID:", pageId);

    // 2️⃣ Fetch Instagram conversations directly from Meta Graph API
    // Using Page-level conversations with Instagram platform filter
    const conversationsUrl = `https://graph.facebook.com/v19.0/${pageId}/conversations?platform=instagram&fields=id,participants{name,id,email,picture},updated_time&access_token=${pageAccessToken}`;
    
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

    // 3️⃣ Get messages for each conversation and enhance user info
    const conversationsWithMessages = await Promise.all(
      conversationsData.data.map(async (conversation: any) => {
        console.log(`📱 Fetching messages for Instagram conversation: ${conversation.id}`);
        
        const messagesUrl = `https://graph.facebook.com/v19.0/${conversation.id}/messages?fields=id,message,from{id,name,username,picture},to{id,name,username,picture},created_time,attachments&access_token=${pageAccessToken}`;
        
        const messagesRes = await fetch(messagesUrl);
        const messagesData = await messagesRes.json();
        
        console.log(`📱 Messages for ${conversation.id}:`, JSON.stringify(messagesData, null, 2));
        
        if (messagesData.error) {
          console.error(`❌ Error fetching messages for ${conversation.id}:`, messagesData.error);
          return {
            ...conversation,
            messages: []
          };
        }

        // 🔍 Enhance participant information by getting user details from Instagram
        const enhancedParticipants = await Promise.all(
          (conversation.participants?.data || []).map(async (participant: any) => {
            if (participant.id === user.id || participant.id === pageId) {
              return participant; // Skip business account/page
            }

            try {
              // Try to get more user info from Instagram Basic Display API
              const userInfoUrl = `https://graph.facebook.com/v19.0/${participant.id}?fields=id,name,username,profile_picture_url&access_token=${pageAccessToken}`;
              const userInfoRes = await fetch(userInfoUrl);
              const userInfo = await userInfoRes.json();

              if (!userInfo.error) {
                console.log(`📱 Enhanced user info for ${participant.id}:`, userInfo);
                return {
                  ...participant,
                  name: userInfo.name || participant.name,
                  username: userInfo.username || participant.username,
                  profile_picture_url: userInfo.profile_picture_url,
                  picture: userInfo.profile_picture_url ? { data: { url: userInfo.profile_picture_url } } : participant.picture
                };
              }
            } catch (error) {
              console.log(`📱 Could not enhance user info for ${participant.id}:`, error);
            }

            return participant;
          })
        );
        
        return {
          ...conversation,
          participants: { data: enhancedParticipants },
          messages: messagesData.data || []
        };
      })
    );

    // 4️⃣ Transform data to match PlatformInbox format (following Messenger pattern)
    const transformed = transformInstagramMetaData(conversationsWithMessages, user.id);
    
    console.log("📱 Transformed Instagram conversations:", JSON.stringify(transformed, null, 2));

    // 5️⃣ Structure response like Messenger (with conversations array)
    return new Response(
      JSON.stringify({
        success: true,
        conversations: transformed,
        debug: {
          raw_conversations_count: conversationsWithMessages.length,
          transformed_count: transformed.length,
          sample_conversation_ids: conversationsWithMessages.slice(0, 2).map(c => c.id)
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
