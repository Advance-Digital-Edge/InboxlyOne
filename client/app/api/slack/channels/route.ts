import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const authUserId = req.headers.get('x-user-id');

  if (!authUserId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  const { data: tokenRow, error } = await supabase
    .from('slack_tokens')
    .select('access_token')
    .eq('auth_user_id', authUserId)
    .single();

  if (error || !tokenRow) {
    return NextResponse.json({ error: 'Slack token not found' }, { status: 404 });
  }

  const token = tokenRow.access_token;

  const slackRes = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { channels, ok } = await slackRes.json();

  if (!ok || !channels) {
    return NextResponse.json({ error: 'Failed to fetch IM channels' }, { status: 500 });
  }

  // Enrich with user display names
  const enriched = await Promise.all(
    channels.map(async (channel: any) => {
      const userRes = await fetch("https://slack.com/api/users.info?user=${channel.user}", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = await userRes.json();
      const name =
        userData.user?.profile?.display_name ||
        userData.user?.real_name ||
        userData.user?.name ||
        'Unknown User';

      return {
        id: channel.id,
        name,
      };
    })
  );

  return NextResponse.json({ ok: true, channels: enriched });
}