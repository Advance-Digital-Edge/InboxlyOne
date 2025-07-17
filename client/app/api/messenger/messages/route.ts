// app/api/messenger/messages/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { transformMessengerData } from "@/lib/utils";

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

  const { data: tokenData, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "facebook")
    .single();


  if (error || !tokenData) {
    return new Response(
      JSON.stringify({
        error: "No Facebook token found. Please connect Messenger.",
      }),
      { status: 401 }
    );
  }


  const metadata = tokenData.metadata;

  if (!metadata?.pages || metadata.pages.length === 0) {
    return new Response(
      JSON.stringify({
        error:
          "No pages found in metadata. Please reconnect your Facebook account.",
      }),
      { status: 400 }
    );
  }

  
  const page = metadata.pages[0]; 

  const accessToken = page.access_token;
  const pageId = page.id;

  if (!accessToken || !pageId) {
    return new Response(
      JSON.stringify({
        error: "Missing page access token or page ID.",
      }),
      { status: 400 }
    );
  }

  try {
    // 🎯 1. Get conversations for the page
    const convRes = await fetch(
      `https://graph.facebook.com/v19.0/${pageId}/conversations?access_token=${accessToken}`
    );

    if (!convRes.ok) throw await convRes.json();
    const convData = await convRes.json();

    const messages = [];

    for (const conv of convData.data) {
      const messagesRes = await fetch(
        `https://graph.facebook.com/v19.0/${conv.id}/messages?fields=message,from,created_time&access_token=${accessToken}`
      );

      if (!messagesRes.ok) continue;

      const msgData = await messagesRes.json();

      messages.push({
        conversationId: conv.id,
        messages: msgData.data,
      });
    }


    const transformed = transformMessengerData(messages, pageId);


    return new Response(JSON.stringify(transformed), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: true,
        message: err?.error?.message || "Failed to fetch Messenger messages.",
        details: err,
      }),
      { status: 500 }
    );
  }
}
