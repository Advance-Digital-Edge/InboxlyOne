// app/api/slack-events/route.ts

// Currently, working with Slack Bot token and not the user token
//TODO: Add support for user token as well

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle Slack URL verification challenge
  if (body.type === 'url_verification' && body.challenge) {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Handle normal Slack event callbacks
  if (body.type === 'event_callback') {
    // Broadcast the event to your WebSocket server
    console.log("Slack event received, broadcasting:", body.event);
    await fetch("http://localhost:4000/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body.event),
    });

    return new NextResponse('Event received');
  }

  return new NextResponse('Invalid request', { status: 400 });
}
