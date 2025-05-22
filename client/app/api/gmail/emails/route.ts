import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
import { formatGmailData } from "@/lib/utils";

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

  // 🧠 Get tokens from your DB
  const { data: tokenData, error } = await supabase
    .from("gmail_tokens")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !tokenData) {
    return new Response(JSON.stringify({ error: "No Gmail token found" }), {
      status: 400,
    });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // 📥 List messages
  const messagesRes = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: 20,
    q: "category:primary newer_than:7d",
  });

  const messageIds = messagesRes.data.messages || [];

  // 🔁 Fetch message details
  const messagePromises = messageIds.map((msg) =>
    gmail.users.messages.get({
      userId: "me",
      id: msg.id!,
      format: "full", // or "full" if you need full body
      metadataHeaders: ["Subject", "From", "Date"],
    })
  );

  const messages = await Promise.all(messagePromises);

  const formatedMessages = messages.map((message) =>
    formatGmailData(message.data)
  );

  return new Response(JSON.stringify(formatedMessages), {
    status: 200,
  });
}
