// /app/api/slack/oauth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const redirectUri = `${process.env.NEXT_PUBLIC_TEMPORARY_SLACK_URL}/api/slack/oauth/callback`;

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const res = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code: code!,
      redirect_uri: redirectUri,
    }),
  });

  const data = await res.json();

  if (!data.ok) {
    return NextResponse.json({ error: 'OAuth failed', details: data }, { status: 400 });
  }

  console.log('User OAuth token:', data.authed_user.access_token);

  // Save the access token to the session or database
  // Example: save to Supabase or your session manager
  // session.set('slack_access_token', data.authed_user.access_token);

   const url = new URL(req.url);
   url.pathname = '/slack-connected';
   url.protocol = 'http:'; // force HTTP

return NextResponse.redirect(url); // or success page
}
