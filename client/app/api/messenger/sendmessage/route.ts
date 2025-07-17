import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
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

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        error: "Missing page access token",
      }),
      { status: 400 }
    );
  }
  try {
    const body = await req.json();
    const { senderId, message } = body;

    if (!senderId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing senderId or message" }),
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: senderId }, 
          message: { text: message },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error sending message:", error);
    return new Response(JSON.stringify({ error: "Failed to send message" }), {
      status: 500,
    });
  }
}
