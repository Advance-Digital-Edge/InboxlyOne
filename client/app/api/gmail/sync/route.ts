// /app/api/gmail/sync/route.ts
import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startHistoryId = searchParams.get("startHistoryId");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: integration } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "gmail")
    .single();

  if (!integration)
    return new Response("No integration found", { status: 404 });

  const tokens = {
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
  };

  const auth = new google.auth.OAuth2();
  auth.setCredentials(tokens);

  const gmail = google.gmail({ version: "v1", auth });

  const historyRes = await gmail.users.history.list({
    userId: "me",
    startHistoryId: startHistoryId || undefined,
    historyTypes: ["messageAdded"],
  });

  const messageIds = historyRes.data.history
    ?.flatMap((h) => h.messages || [])
    .map((msg) => msg.id)
    .filter(Boolean) as string[];

  const newMessages = await Promise.all(
    messageIds.map((id) =>
      gmail.users.messages.get({ userId: "me", id }).then((res) => res.data)
    )
  );

  return Response.json({
    count: newMessages.length,
    messages: newMessages,
  });
}
