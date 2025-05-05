// app/api/slack-events/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle Slack URL verification challenge
  if (body.type === 'url_verification' && body.challenge) {
    console.log('Slack challenge received:', body.challenge);
    return NextResponse.json({ challenge: body.challenge });
  }

  // Handle normal Slack event callbacks
  if (body.type === 'event_callback') {
    console.log('Slack event received:', body.event);
    // You can do something with body.event here (save to Supabase, etc.)
    return new NextResponse('Event received');
  }

  return new NextResponse('Invalid request', { status: 400 });
}
