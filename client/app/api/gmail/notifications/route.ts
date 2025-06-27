import { NextRequest } from "next/server";
import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";

// Required to decode base64
const decodeBase64Json = (message: string) => {
  const buffer = Buffer.from(message, "base64").toString("utf-8");
  return JSON.parse(buffer);
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.data) {
      return new Response("Bad Request: No message data", { status: 400 });
    }

    const data = decodeBase64Json(message.data);
    const emailAddress = data.emailAddress;
    const historyId = data.historyId;

    console.log("Received Pub/Sub webhook:", emailAddress);

    if (!emailAddress || !historyId) {
      return new Response("Bad Request: Missing fields", { status: 400 });
    }

    const supabase = await createClient();

    const { data: integration, error } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("provider", "gmail")
      .filter("metadata->>email", "eq", emailAddress)
      .single();

    if (!integration) {
      return new Response("User not found for email", { status: 404 });
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    const gmail = google.gmail({ version: "v1", auth });

    const previousHistoryId = integration.metadata?.historyId;

    if (previousHistoryId && BigInt(historyId) <= BigInt(previousHistoryId)) {
      return new Response("Already processed", { status: 200 });
    }

    let historyResponse;
    let historyItems = [];
    let hasNewMessages = false;
    let lastMessageId = null;

    try {
      // Try to fetch history using stored historyId
      historyResponse = await gmail.users.history.list({
        userId: "me",
        startHistoryId: previousHistoryId,
        historyTypes: ["messageAdded"],
        maxResults: 20,
      });
      historyItems = historyResponse.data.history || [];
    } catch (err: any) {
      // Check if error is 400 Bad Request (likely invalid historyId)
      if (err.code === 400) {
        console.log("Invalid startHistoryId, falling back to full fetch");

        // Fallback: fetch recent messages without startHistoryId
        const messagesResponse = await gmail.users.messages.list({
          userId: "me",
          maxResults: 20,
          q: "in:inbox is:unread",
        });

        const messages = messagesResponse.data.messages || [];

        // Manually create a "history-like" array with messages added
        historyItems = messages.map((msg) => ({
          messagesAdded: [{ message: { id: msg.id } }],
        }));

        // Update historyId to latest from response or fallback to new historyId from webhook

        await supabase
          .from("user_integrations")
          .update({
            metadata: {
              ...integration.metadata,
              historyId, // update with current webhook historyId
            },
          })
          .eq("id", integration.id);
      } else {
        throw err; // rethrow if other errors
      }
    }

    // Process historyItems as usual
    for (const historyItem of historyItems) {
      const messagesAdded = historyItem.messagesAdded || [];

      for (const msg of messagesAdded) {
        if (!msg.message || !msg.message.id) continue;
        lastMessageId = msg.message.id;
        hasNewMessages = true;

        // TODO: handle the new message here
      }
    }

    if (hasNewMessages) {
      // Update historyId in DB with current webhook historyId
      await supabase
        .from("user_integrations")
        .update({
          metadata: {
            ...integration.metadata,
            historyId,
            lastMessageId,
          },
        })
        .eq("id", integration.id);

      return new Response("OK", { status: 200 });
    }

    return new Response("No new messages", { status: 200 });
  } catch (err: any) {
    console.error(
      "Pub/Sub webhook error:",
      err.response.data.error_description
    );
    return new Response("Internal Server Error", { status: 500 });
  }
}
