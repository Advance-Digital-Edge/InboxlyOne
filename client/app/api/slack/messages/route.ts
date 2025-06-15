import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const authUserId = req.headers.get('x-user-id');
    if (!authUserId) {
      return NextResponse.json({ ok: false, messages: [], error: 'Missing user ID' }, { status: 400 });
    }

    const { data: tokenRow, error } = await supabase
      .from('slack_tokens')
      .select('access_token, slack_user_id')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !tokenRow) {
      return NextResponse.json({ ok: false, messages: [], error: 'Slack token not found' }, { status: 404 });
    }

    const token = tokenRow.access_token;
    const currentUserSlackId = tokenRow.slack_user_id;

    // Step 1: Get all IM channels
    const imRes = await fetch('https://slack.com/api/conversations.list?types=im', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const imData = await imRes.json();
    const channels = imData.channels;

    if (!imData.ok || !Array.isArray(channels)) {
      return NextResponse.json({
        ok: false,
        messages: [],
        error: imData.error || "Failed to fetch channels from Slack"
      }, { status: 500 });
    }

    const messages = await Promise.all(
      channels.map(async (channel: any, index: number) => {
        // Get conversation partner's user info
        const userRes = await fetch(`https://slack.com/api/users.info?user=${channel.user}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userInfo = await userRes.json();

        const partnerName =
          userInfo.user?.profile?.display_name ||
          userInfo.user?.real_name ||
          userInfo.user?.name ||
          'Unknown User';

        const avatar = userInfo.user?.profile?.image_72 || '';

        // Fetch last_read for this channel
        const infoRes = await fetch(`https://slack.com/api/conversations.info?channel=${channel.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const infoData = await infoRes.json();
        const lastRead = infoData.channel?.last_read || "0";

        // Fetch message history
        const historyRes = await fetch(`https://slack.com/api/conversations.history?channel=${channel.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const history = await historyRes.json();

        const allMessages = history.messages || [];

        // Get all unique user IDs from messages
        const uniqueUserIds = [
          ...Array.from(new Set(allMessages.map((msg: any) => msg.user).filter(Boolean))) as string[]
        ];

        // Fetch all user names
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

        // Sort messages by timestamp in ascending order
        const conversation = allMessages
          .sort((a: any, b: any) => parseFloat(a.ts) - parseFloat(b.ts))
          .map((msg: any, i: number) => ({
            id: i,
            senderId: msg.user || 'system',
            sender: userMap[msg.user] || 'Unknown User',
            content: msg.text,
            timestamp: new Date(parseFloat(msg.ts) * 1000).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
            ts: msg.ts, // <-- add this line
            isIncoming: msg.user !== currentUserSlackId,
            unread: parseFloat(msg.ts) > parseFloat(lastRead),
          }));

        const lastMessage = allMessages[allMessages.length - 1];

        // Mark the whole conversation as unread if any message is unread
        const hasUnread = conversation.some((msg: any) => msg.unread);

        return {
          id: index,
          sender: partnerName,         // The name of the person you're chatting with
          senderId: channel.user,      // Their Slack ID
          avatar,
          preview: lastMessage?.text || "No messages yet",
          timestamp: lastMessage
            ? new Date(parseFloat(lastMessage.ts) * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false, // Use 24-hour format; set to `true` for 12-hour format
              })
            : '',
          ts: lastMessage ? lastMessage.ts : "0", // <-- add this
          platform: 'Slack',
          unread: hasUnread,
          tags: [],
          conversation,
        };
      })
    );

    // Order conversations by latest message ts (descending)
    const orderedMessages = messages.sort(
      (a, b) => parseFloat(b.ts) - parseFloat(a.ts)
    );

    return NextResponse.json({ ok: true, messages: orderedMessages });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, messages: [], error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authUserId = req.headers.get('x-user-id');

  if (!authUserId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  const { toUserId, text } = await req.json();

  if (!toUserId || !text) {
    return NextResponse.json({ error: 'Missing toUserId or text' }, { status: 400 });
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

  // 1. Open or fetch the DM channel
  const openRes = await fetch('https://slack.com/api/conversations.open', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ users: toUserId })
  });

  const openData = await openRes.json();

  if (!openData.ok) {
    return NextResponse.json({ error: openData.error }, { status: 500 });
  }

  const channelId = openData.channel.id;

  // 2. Send the message
  const sendRes = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      channel: channelId,
      text
    })
  });

  const sendData = await sendRes.json();

  if (!sendData.ok) {
    return NextResponse.json({ error: sendData.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ts: sendData.ts });
}