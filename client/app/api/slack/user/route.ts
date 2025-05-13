import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const authUserId = req.headers.get('x-user-id'); // custom header from frontend

  if (!authUserId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  const { data: tokenRow, error } = await supabase
    .from('slack_tokens')
    .select('access_token, slack_user_id')
    .eq('auth_user_id', authUserId)
    .single();

  if (error || !tokenRow) {
    return NextResponse.json({ error: 'Slack token not found' }, { status: 404 });
  }

  // 🔧 Correct Slack endpoint with required user param
  const slackRes = await fetch(`https://slack.com/api/users.info?user=${tokenRow.slack_user_id}`, {
    headers: {
      Authorization: `Bearer ${tokenRow.access_token}`,
    },
  });

  const slackData = await slackRes.json();

  if (!slackData.ok) {
    return NextResponse.json({ error: slackData.error }, { status: 500 });
  }

  return NextResponse.json(slackData.user); // send only user object
}
