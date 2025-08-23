// app/api/messenger/conversation/[conversationId]/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { transformMessengerRawConversations } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ conversationId: string }> } // 👈 това е context, не директно { params }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { conversationId } = await context.params;

  const { data: pages, error: pagesError } = await supabase
    .from("facebook_pages")
    .select("*")
    .eq("user_id", user.id);

  if (pagesError || !pages || pages.length === 0) {
    return new Response(
      JSON.stringify({ error: "No Facebook pages found for this user." }),
      { status: 400 }
    );
  }

  const page = pages[0];
  const accessToken = page.access_token;

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "Missing page access token." }),
      { status: 400 }
    );
  }

  try {
    const messagesRes = await fetch(
      `https://graph.facebook.com/v19.0/${conversationId}/messages?fields=message,from,created_time&access_token=${accessToken}`
    );

    if (!messagesRes.ok) {
      const err = await messagesRes.json();
      return new Response(JSON.stringify({ error: err.error.message }), {
        status: 500,
      });
    }

    const msgData = await messagesRes.json();
 

    const transformedMessages = msgData.data
      .reverse() // sort messages in ascending order
      .map((msg: any) => transformMessengerRawConversations(msg, page.page_id));

    return new Response(JSON.stringify(transformedMessages), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: "Failed to fetch conversation messages.",
        details: err,
      }),
      { status: 500 }
    );
  }
}
