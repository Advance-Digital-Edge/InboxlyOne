// app/api/notifications/route.ts

import { NextRequest } from "next/server";

// Handle GET (for Facebook webhook verification)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Forbidden", { status: 403 });
  }
}

// Handle POST (for receiving events/messages)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "page") {
      for (const entry of body.entry) {
        for (const event of entry.messaging) {
          const senderId = event.sender.id;

          // ✅ Handle incoming message
          if (event.message?.text) {
            const message = event.message.text;

            try {
              const response = await fetch(
                "http://localhost:4000/facebook-message",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ senderId, message }),
                }
              );

              if (!response.ok) {
                console.error("Failed to send message:", await response.text());
              } else {
                console.log("Successfully sent message to socket server");
              }
            } catch (error) {
              console.error("Error sending to socket server:", error);
            }
          }

          // ✅ Handle read event (user has seen messages)
          if (event.read) {
            const watermark = event.read.watermark; // timestamp of last seen message

            try {
              const response = await fetch(
                "http://localhost:4000/facebook-message-seen",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ senderId, seenAt: watermark }),
                }
              );

              if (!response.ok) {
                const errorText = await response.text();

                console.error("❌ Failed to send seen event");
                console.error("Status:", response.status);
                console.error("Status Text:", response.statusText);
                console.error(
                  "Headers:",
                  Object.fromEntries(response.headers.entries())
                );
                console.error("Body:", errorText);
              } else {
                console.log("✅ Successfully sent seen event to socket server");
              }
            } catch (error) {
              console.error("Error sending seen event:", error);
            }
          }
        }
      }

      return new Response("EVENT_RECEIVED", { status: 200 });
    }

    return new Response("Not a page object", { status: 404 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
