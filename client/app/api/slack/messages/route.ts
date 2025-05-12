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

  // Step 1: Get all IM channels
  const imRes = await fetch('https://slack.com/api/conversations.list?types=im', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const { channels } = await imRes.json();

  const dms = await Promise.all(
    channels.map(async (channel: any) => {
      // Get the DM partner’s name
      const userRes = await fetch(`https://slack.com/api/users.info?user=${channel.user}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userInfo = await userRes.json();
      const displayName =
        userInfo.user?.profile?.display_name ||
        userInfo.user?.real_name ||
        userInfo.user?.name ||
        'Unknown User';

      // Get message history
      const historyRes = await fetch(`https://slack.com/api/conversations.history?channel=${channel.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const history = await historyRes.json();

      // Get unique user IDs from messages
      const uniqueUserIds: string[] = [
        ...Array.from(new Set((history.messages || []).map((msg: any) => msg.user).filter(Boolean))) as string[]
      ];

      // Fetch user names for all users in the message list
      const userMap: Record<string, string> = {};
      await Promise.all(
        uniqueUserIds.map(async (userId: string) => {
          const res = await fetch(`https://slack.com/api/users.info?user=${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          userMap[userId] =
            data.user?.profile?.display_name ||
            data.user?.real_name ||
            data.user?.name ||
            'Unknown User';
        })
      );

      // Enrich each message with userId and userName
      const enrichedMessages = (history.messages || []).map((msg: any) => ({
        ...msg,
        userId: msg.user,
        userName: userMap[msg.user] || 'Unknown User'
      }));

      return {
        channelId: channel.id,
        channelName: displayName,
        messages: enrichedMessages
      };
    })
  );

  return NextResponse.json({ ok: true, dms });
}
