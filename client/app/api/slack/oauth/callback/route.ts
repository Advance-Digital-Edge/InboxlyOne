import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with server-side only key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const authUserId = req.nextUrl.searchParams.get('state'); // Sent from frontend
  const redirectUri = `${process.env.NEXT_PUBLIC_TEMPORARY_SLACK_URL}/api/slack/oauth/callback`;

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  if (!authUserId) {
    return NextResponse.json({ error: 'Missing auth user ID in state param' }, { status: 400 });
  }

  const res = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await res.json();

  if (!data.ok) {
    return NextResponse.json({ error: 'OAuth failed', details: data }, { status: 400 });
  }

  const accessToken = data.authed_user.access_token;
  const slackUserId = data.authed_user.id;

  const insertPayload = {
    auth_user_id: authUserId,
    slack_user_id: slackUserId,
    access_token: accessToken,
  };

  const { error } = await supabase.from('slack_tokens').upsert([insertPayload]);

  if (error) {
    console.error('Insert payload:', insertPayload);
    console.error('Supabase insert error:', error);
    console.error('Supabase insert error:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Failed to save token', details: error }, { status: 500 });
  }
 
  const url = new URL(req.url);
  url.pathname = '/slack-connected';

  return NextResponse.redirect(url); //Or success page
}
