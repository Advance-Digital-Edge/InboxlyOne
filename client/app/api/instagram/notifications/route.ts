import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Instagram webhook verification
  const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "your_verify_token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  
  try {
    const body = await req.json();
    console.log("Instagram webhook received:", JSON.stringify(body, null, 2));

    // Instagram sends webhook notifications for various events
    // For messaging, you would typically receive events like:
    // - messages (new message received)
    // - messaging_postbacks (user clicked a button)
    // - messaging_handovers (conversation handover)

    if (body.object === "instagram") {
      for (const entry of body.entry || []) {
        const messaging = entry.messaging || [];
        
        for (const event of messaging) {
          if (event.message) {
            // Handle incoming message
            await handleIncomingMessage(event, supabase);
          } else if (event.postback) {
            // Handle postback (button clicks, etc.)
            await handlePostback(event, supabase);
          }
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Instagram webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function handleIncomingMessage(event: any, supabase: any) {
  try {
    const senderId = event.sender.id;
    const recipientId = event.recipient.id;
    const message = event.message;
    const timestamp = event.timestamp;

    console.log("New Instagram message:", {
      senderId,
      recipientId,
      message: message.text,
      timestamp,
    });

    // Here you would:
    // 1. Find the user integration for this Instagram account
    // 2. Store the message in your database
    // 3. Send real-time notification to the user's client
    // 4. Update conversation thread

    // Example implementation:
    /*
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("provider", "instagram")
      .eq("external_account_id", recipientId)
      .single();

    if (integration) {
      // Store message in database
      await supabase.from("instagram_messages").insert({
        user_id: integration.user_id,
        integration_id: integration.id,
        sender_id: senderId,
        recipient_id: recipientId,
        message_text: message.text,
        message_id: message.mid,
        timestamp: new Date(timestamp),
        direction: "incoming",
      });

      // Send real-time notification via websocket/pusher
      // await sendRealTimeNotification(integration.user_id, messageData);
    }
    */

  } catch (error) {
    console.error("Error handling Instagram message:", error);
  }
}

async function handlePostback(event: any, supabase: any) {
  try {
    const senderId = event.sender.id;
    const recipientId = event.recipient.id;
    const postback = event.postback;

    console.log("Instagram postback:", {
      senderId,
      recipientId,
      payload: postback.payload,
      title: postback.title,
    });

    // Handle button clicks or other postback events
    // Similar to message handling but for interactive elements

  } catch (error) {
    console.error("Error handling Instagram postback:", error);
  }
}
