import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { transformInstagramData } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
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
    const { conversationId } = params;
    
    console.log("📱 Instagram conversation API called with ID:", conversationId);
    
    if (!conversationId || conversationId === 'undefined') {
      return new Response(
        JSON.stringify({ 
          error: "Invalid conversation ID",
          received_id: conversationId,
          debug: "Conversation ID is missing or undefined"
        }),
        { status: 400 }
      );
    }

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
    const pageAccessToken = metadata?.page_access_token || access_token;
    const pageId = metadata?.page_id;
    
    // Get Instagram account details from instagram_accounts table
    const { data: instagramAccount, error: igError } = await supabase
      .from("instagram_accounts")
      .select("username, profile_picture")
      .eq("instagram_id", external_account_id)
      .single();

    const instagramUsername = instagramAccount?.username || "Instagram Business";
    const instagramAvatar = instagramAccount?.profile_picture || "";
    
    console.log(`📱 Fetching Instagram conversation details for: ${conversationId}`);
    console.log(`📱 Instagram Username: ${instagramUsername}`);

    // 2️⃣ Get conversation details with enhanced participant fields including detailed pictures
    const conversationUrl = `https://graph.facebook.com/v19.0/${conversationId}?fields=id,participants{id,name,username,picture{data{url}}},updated_time&access_token=${pageAccessToken}`;
    
    const conversationRes = await fetch(conversationUrl);
    const conversationData = await conversationRes.json();

    console.log("📱 Instagram API conversation response:", JSON.stringify(conversationData, null, 2));
    
    if (conversationData.participants) {
      console.log("📱 Participants data structure:");
      conversationData.participants.data?.forEach((participant: any, index: number) => {
        console.log(`📱 Participant ${index}:`, {
          id: participant.id,
          name: participant.name,
          username: participant.username,
          picture: participant.picture
        });
      });
    }

    if (conversationData.error) {
      return new Response(
        JSON.stringify({
          error: true,
          message: conversationData.error.message || "Failed to fetch conversation details.",
          details: conversationData.error,
        }),
        { status: 500 }
      );
    }

    // 3️⃣ Get all messages for this conversation with enhanced sender info
    const messagesUrl = `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=id,message,from{id,name,username},created_time&limit=20&access_token=${pageAccessToken}`;
    
    const messagesRes = await fetch(messagesUrl);
    const messagesData = await messagesRes.json();

    console.log(`📱 Messages for conversation ${conversationId}:`, JSON.stringify(messagesData, null, 2));

    if (messagesData.error) {
      return new Response(
        JSON.stringify({
          error: true,
          message: messagesData.error.message || "Failed to fetch conversation messages.",
          details: messagesData.error,
        }),
        { status: 500 }
      );
    }

    // 4️⃣ Combine conversation and messages data
    const conversationWithMessages = {
      ...conversationData,
      messages: messagesData.data || []
    };

    // 5️⃣ Transform data using the existing function with Instagram Business Account ID
    const transformed = transformInstagramData([conversationWithMessages], external_account_id, instagramUsername, instagramAvatar); // Use Instagram username and avatar

    console.log("📱 Using Instagram Business Account ID for filtering:", external_account_id);
    console.log("📱 Page ID (Facebook):", pageId);
    console.log("📱 Instagram Username:", instagramUsername);

    return new Response(
      JSON.stringify({
        success: true,
        conversation: transformed[0] || null,
        page_name: instagramUsername, // Use Instagram username for outgoing messages
        instagram_avatar: instagramAvatar, // Include Instagram profile picture
        note: `Loaded conversation with ${messagesData.data?.length || 0} messages`
      }),
      { status: 200 }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: true,
        message: err?.message || "Unexpected error while fetching conversation details",
        details: err,
      }),
      { status: 500 }
    );
  }
}