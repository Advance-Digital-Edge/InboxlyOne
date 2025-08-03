import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
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
      return NextResponse.json({ error: "Instagram integration not found" }, { status: 404 });
    }

    const { access_token } = integration;
    const { conversationId } = params;
    
    console.log("📱 Fetching Instagram conversation messages for:", conversationId);

    // Get messages for specific conversation
    const messagesUrl = `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=id,from,to,message,created_time&access_token=${access_token}`;
    console.log("📱 Messages URL:", messagesUrl.replace(access_token, "***TOKEN***"));

    const messagesRes = await fetch(messagesUrl);
    const messagesData = await messagesRes.json();

    console.log("📱 Messages response status:", messagesRes.status);
    console.log("📱 Messages response:", JSON.stringify(messagesData, null, 2));

    if (messagesData.error) {
      console.error("❌ Instagram messages API error:", messagesData.error);
      return NextResponse.json({ error: messagesData.error }, { status: 400 });
    }

    const messages = messagesData.data || [];
    console.log("📱 Found", messages.length, "messages in conversation");

    return NextResponse.json({
      success: true,
      messages,
      conversationId
    });

  } catch (error) {
    console.error("❌ Instagram conversation messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}