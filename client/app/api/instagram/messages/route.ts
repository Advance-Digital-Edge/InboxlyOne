// app/api/instagram/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Instagram integration
    const { data: integration, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "instagram")
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({
        success: false,
        data: [],
        messages: null,
        note: "Instagram integration not found. Please connect your Instagram account first."
      });
    }

    const { access_token, external_account_id, metadata } = integration;
    const pageId = metadata?.page_id;
    const pageAccessToken = metadata?.page_access_token || access_token;
    
    console.log("📱 Fetching Instagram DMs - CORRECT FLOW...");
    console.log("📱 Instagram Business Account ID:", external_account_id);
    console.log("📱 Facebook Page ID:", pageId);

    // STEP 1: Get Instagram conversations through the INSTAGRAM BUSINESS ACCOUNT
    // This is the CORRECT endpoint for Instagram DMs
    const instagramConversationsUrl = `https://graph.facebook.com/v19.0/${external_account_id}/conversations?fields=id,participants,updated_time&access_token=${pageAccessToken}`;
    
    console.log("📱 Instagram Conversations URL:", instagramConversationsUrl.replace(pageAccessToken, "***TOKEN***"));

    const conversationsRes = await fetch(instagramConversationsUrl);
    const conversationsData = await conversationsRes.json();

    console.log("📱 Instagram Conversations response:", JSON.stringify(conversationsData, null, 2));

    if (conversationsData.error) {
      // If error code 3 = App doesn't have capability
      if (conversationsData.error.code === 3) {
        console.log("❌ App in development mode - Instagram messaging not available");
        console.log("📱 Using mock Instagram DM data for development");
        
        const mockInstagramConversations = [
          {
            id: "ig_mock_conv_1",
            participants: {
              data: [
                { name: "Test Instagram User", id: "ig_test_user_123" },
                { name: "Supergemhere", id: external_account_id }
              ]
            },
            updated_time: new Date().toISOString(),
            messages: [
              {
                id: "ig_mock_msg_1",
                message: "Hey! Love your recent post. Are you selling this item?",
                from: { name: "Test Instagram User", id: "ig_test_user_123" },
                to: { data: [{ name: "Supergemhere", id: external_account_id }] },
                created_time: new Date(Date.now() - 1000 * 60 * 10).toISOString()
              },
              {
                id: "ig_mock_msg_2", 
                message: "Hi! Thanks for reaching out. Yes, it's available. Would you like more details?",
                from: { name: "Supergemhere", id: external_account_id },
                to: { data: [{ name: "Test Instagram User", id: "ig_test_user_123" }] },
                created_time: new Date(Date.now() - 1000 * 60 * 5).toISOString()
              }
            ]
          }
        ];

        return NextResponse.json({
          success: true,
          data: mockInstagramConversations,
          note: "Mock Instagram DM data - Real DMs require Meta app review approval"
        });
      }
      
      throw new Error(`Instagram API Error: ${conversationsData.error.message}`);
    }

    if (!conversationsData.data || conversationsData.data.length === 0) {
      console.log("📱 No Instagram conversations found");
      return NextResponse.json({
        success: true,
        data: [],
        note: "No Instagram DM conversations found. Make sure you have Instagram DMs in your business account."
      });
    }

    console.log(`📱 Found ${conversationsData.data.length} Instagram conversations`);

    // STEP 2: Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversationsData.data.map(async (conversation: any) => {
        console.log(`📱 Fetching messages for Instagram conversation: ${conversation.id}`);
        
        const messagesUrl = `https://graph.facebook.com/v19.0/${conversation.id}/messages?fields=id,message,from,to,created_time,attachments&access_token=${pageAccessToken}`;
        
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
        
        return {
          ...conversation,
          messages: messagesData.data || []
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: conversationsWithMessages,
      note: `Found ${conversationsWithMessages.length} Instagram DM conversations`
    });

  } catch (error) {
    console.error("❌ Instagram DM error:", error);
    return NextResponse.json({
      success: false,
      data: [],
      error: error.message || "Failed to fetch Instagram DMs"
    }, { status: 500 });
  }
}

// FALLBACK: Try to get Instagram DMs through Page when direct access fails
async function getInstagramDMsThroughPage(pageId: string, pageAccessToken: string, igAccountId: string) {
  console.log("🎯 FALLBACK: Trying to get Instagram DMs through Page...");
  
  // Get Page conversations and filter for Instagram
  const pageConversationsUrl = `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=id,participants,messages.limit(5){id,message,from,created_time},platform&access_token=${pageAccessToken}`;
  
  const pageConversationsRes = await fetch(pageConversationsUrl);
  const pageConversationsData = await pageConversationsRes.json();
  
  console.log("📱 Page conversations (filtering for Instagram):", JSON.stringify(pageConversationsData, null, 2));
  
  if (pageConversationsData.error) {
    return NextResponse.json({
      success: false,
      data: [],
      error: `Page conversations failed: ${pageConversationsData.error.message}`
    });
  }
  
  // Filter conversations that might be from Instagram
  const conversations = pageConversationsData.data || [];
  
  // Try to identify Instagram conversations by checking participants or message content
  const possibleInstagramConversations = conversations.filter((conv: any) => {
    // Check if any participant is the Instagram account
    const participants = conv.participants?.data || [];
    const hasInstagramAccount = participants.some((p: any) => p.id === igAccountId);
    
    // Or check if platform field indicates Instagram (if available)
    const isInstagramPlatform = conv.platform === 'instagram';
    
    console.log(`🔍 Conversation ${conv.id}: hasInstagramAccount=${hasInstagramAccount}, platform=${conv.platform}`);
    
    return hasInstagramAccount || isInstagramPlatform;
  });
  
  console.log(`📱 Found ${possibleInstagramConversations.length} possible Instagram conversations out of ${conversations.length} total`);
  
  if (possibleInstagramConversations.length === 0) {
    return NextResponse.json({
      success: true,
      data: [],
      note: "No Instagram conversations found in Page conversations. You may need actual Instagram DMs or app review approval."
    });
  }
  
  // Get full messages for filtered conversations
  const conversationsWithMessages = await Promise.all(
    possibleInstagramConversations.map(async (conversation: any) => {
      if (conversation.messages?.data) {
        // Already has messages from the initial query
        return conversation;
      }
      
      // Fetch full messages
      const messagesUrl = `https://graph.facebook.com/v19.0/${conversation.id}/messages?fields=id,message,from,to,created_time&access_token=${pageAccessToken}`;
      
      const messagesRes = await fetch(messagesUrl);
      const messagesData = await messagesRes.json();
      
      if (messagesData.error) {
        console.error(`❌ Error fetching messages for ${conversation.id}:`, messagesData.error);
        return {
          ...conversation,
          messages: []
        };
      }
      
      return {
        ...conversation,
        messages: messagesData.data || []
      };
    })
  );
  
  return NextResponse.json({
    success: true,
    data: conversationsWithMessages,
    note: `Found ${conversationsWithMessages.length} Instagram conversations (via Page fallback method)`
  });
}
