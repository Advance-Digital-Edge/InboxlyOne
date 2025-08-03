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
    
    console.log("📱 Fetching REAL Instagram DM conversations...");
    console.log("📱 Instagram Business Account ID:", external_account_id);
    console.log("📱 Facebook Page ID:", pageId);

    if (!external_account_id) {
      return NextResponse.json({
        success: false,
        data: [],
        messages: null,
        note: "Instagram Business Account ID not found. Please reconnect your Instagram account."
      });
    }

    // Method 1: Try Instagram Business Account conversations directly
    console.log("🎯 Method 1: Trying Instagram Business Account conversations...");
    const igConversationsUrl = `https://graph.facebook.com/v19.0/${external_account_id}/conversations?access_token=${pageAccessToken}`;
    console.log("📱 IG Conversations URL:", igConversationsUrl.replace(pageAccessToken, "***TOKEN***"));

    const igConversationsRes = await fetch(igConversationsUrl);
    const igConversationsData = await igConversationsRes.json();

    console.log("📱 IG Conversations response status:", igConversationsRes.status);
    console.log("📱 IG Conversations response:", JSON.stringify(igConversationsData, null, 2));

    if (!igConversationsData.error && igConversationsData.data) {
      console.log("✅ Found Instagram conversations via Business Account!");
      
      // Fetch messages for each Instagram conversation
      const conversationsWithMessages = await Promise.all(
        igConversationsData.data.map(async (conversation: any) => {
          try {
            console.log(`📱 Fetching IG messages for conversation: ${conversation.id}`);
            
            const messagesUrl = `https://graph.facebook.com/v19.0/${conversation.id}/messages?fields=id,message,from,to,created_time&access_token=${pageAccessToken}`;
            console.log("📱 IG Messages URL:", messagesUrl.replace(pageAccessToken, "***TOKEN***"));
            
            const messagesRes = await fetch(messagesUrl);
            const messagesData = await messagesRes.json();
            
            console.log(`📱 IG Messages for ${conversation.id}:`, JSON.stringify(messagesData, null, 2));
            
            if (messagesData.error) {
              console.error(`❌ Error fetching IG messages for ${conversation.id}:`, messagesData.error);
              return {
                ...conversation,
                messages: []
              };
            }
            
            return {
              ...conversation,
              messages: messagesData.data || []
            };
          } catch (error) {
            console.error(`❌ Error processing IG conversation ${conversation.id}:`, error);
            return {
              ...conversation,
              messages: []
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        data: conversationsWithMessages,
        messages: null,
        note: `Found ${conversationsWithMessages.length} Instagram DM conversations`
      });
    }

    // Method 2: Try Page conversations but filter for Instagram source
    console.log("🎯 Method 2: Trying Page conversations filtered for Instagram...");
    const pageConversationsUrl = `https://graph.facebook.com/v19.0/${pageId}/conversations?fields=id,participants,messages.limit(1){message,from,created_time},senders&access_token=${pageAccessToken}`;
    console.log("📱 Page Conversations URL:", pageConversationsUrl.replace(pageAccessToken, "***TOKEN***"));

    const pageConversationsRes = await fetch(pageConversationsUrl);
    const pageConversationsData = await pageConversationsRes.json();

    console.log("📱 Page Conversations response:", JSON.stringify(pageConversationsData, null, 2));

    if (pageConversationsData.error) {
      return NextResponse.json({
        success: false,
        data: [],
        messages: null,
        error: pageConversationsData.error,
        note: "Both Instagram Business Account and Page conversations failed. Check permissions and account setup."
      });
    }

    // Filter conversations that might be from Instagram
    const conversations = pageConversationsData.data || [];
    const possibleInstagramConversations = conversations.filter((conv: any) => {
      // Instagram conversations might have different characteristics
      // This is a guess - you might need to adjust the filter logic
      const participants = conv.participants?.data || [];
      
      // Check if any participant has Instagram-like characteristics
      const hasInstagramUser = participants.some((p: any) => 
        !p.email || !p.email.includes('@facebook.com')
      );
      
      console.log(`🔍 Conversation ${conv.id} - hasInstagramUser: ${hasInstagramUser}`, participants);
      return hasInstagramUser;
    });

    console.log(`🎯 Found ${possibleInstagramConversations.length} possible Instagram conversations out of ${conversations.length} total`);

    // Fetch full messages for filtered conversations
    const conversationsWithMessages = await Promise.all(
      possibleInstagramConversations.map(async (conversation: any) => {
        try {
          console.log(`📱 Fetching messages for possible IG conversation: ${conversation.id}`);
          
          const messagesUrl = `https://graph.facebook.com/v19.0/${conversation.id}/messages?fields=id,message,from,to,created_time&access_token=${pageAccessToken}`;
          
          const messagesRes = await fetch(messagesUrl);
          const messagesData = await messagesRes.json();
          
          console.log(`📱 Messages for possible IG conversation ${conversation.id}:`, JSON.stringify(messagesData, null, 2));
          
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
        } catch (error) {
          console.error(`❌ Error processing conversation ${conversation.id}:`, error);
          return {
            ...conversation,
            messages: []
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: conversationsWithMessages,
      messages: null,
      note: `Found ${conversationsWithMessages.length} conversations (filtered for Instagram)`
    });

  } catch (error) {
    console.error("❌ Instagram messages error:", error);
    return NextResponse.json({
      success: false,
      data: [],
      messages: null,
      error: "Internal server error"
    }, { status: 500 });
  }
}
