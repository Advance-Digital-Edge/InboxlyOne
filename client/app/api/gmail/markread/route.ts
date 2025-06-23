import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { messageId } = await req.json();

  if (!messageId) {
    return new Response(JSON.stringify({ error: "Missing messageId" }), {
      status: 400,
    });
  }

  // Get tokens from DB
  const { data: tokenData, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "gmail")
    .single();

  if (error || !tokenData) {
    return new Response(JSON.stringify({ error: "No Gmail token found" }), {
      status: 400,
    });
  }


  // Initialize OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error: any) {
    const statusCode = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.error?.message || error.message || "Unknown error";

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: statusCode,
          message: errorMessage,
          details: error?.response?.data || null,
        },
      }),
      { status: statusCode }
    );
  }
}
