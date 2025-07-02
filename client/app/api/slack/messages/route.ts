import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getValidSlackToken, SlackTokenData } from '@/lib/slack-token-manager';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Helper function to check for token-related errors in Slack API responses
 * @param response The JSON response from a Slack API call
 * @returns true if the error is related to an invalid token
 */
function isTokenError(response: any): boolean {
  if (!response.ok) {
    const errorMsg = response.error?.toLowerCase() || '';
    return errorMsg.includes('token') || 
           errorMsg.includes('auth') || 
           errorMsg.includes('invalid_auth') ||
           errorMsg.includes('expired');
  }
  return false;
}

export async function GET(req: NextRequest) {
  try {
    const authUserId = req.headers.get('x-user-id');
    if (!authUserId) {
      return NextResponse.json({ ok: false, messages: [], error: 'Missing user ID' }, { status: 400 });
    }

    const url = new URL(req.url);
    const channelId = url.searchParams.get('channelId');
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // If channelId is provided, return paginated conversation messages
    if (channelId) {
      return getConversationMessages(authUserId, channelId, cursor, limit);
    }

    // Otherwise, return conversation list (existing functionality)
    const tokenData = await getValidSlackToken(authUserId);
    
    if (!tokenData) {
      return NextResponse.json({ ok: false, messages: [], error: 'Slack token not found or expired' }, { status: 404 });
    }

    const token = tokenData.access_token;
    const currentUserSlackId = tokenData.slack_user_id;

    // Step 1: Get all IM channels
    const imRes = await fetch('https://slack.com/api/conversations.list?types=im', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const imData = await imRes.json();
    const channels = imData.channels;

    if (!imData.ok || !Array.isArray(channels)) {
      // Check if this is a token-related error
      if (isTokenError(imData)) {
        return NextResponse.json({
          ok: false,
          messages: [],
          error: "Slack authentication expired. Please reconnect your account.",
          requiresReauth: true
        }, { status: 401 });
      }
      
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
        const lastRead = infoData.ok && infoData.channel?.last_read ? infoData.channel.last_read : "0";

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
          channelId: channel.id,       // Channel ID for marking as read
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

  const { toUserId, text, channelId, tempMessageId } = await req.json();

  if ((!toUserId && !channelId) || !text) {
    return NextResponse.json({ error: 'Missing toUserId/channelId or text' }, { status: 400 });
  }

  const tokenData = await getValidSlackToken(authUserId);
  
  if (!tokenData) {
    return NextResponse.json({ error: 'Slack token not found or expired' }, { status: 404 });
  }

  const token = tokenData.access_token;
  let targetChannelId = channelId;

  // If no channelId provided, open DM channel with user
  if (!targetChannelId && toUserId) {
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
      // Check if this is a token-related error
      if (isTokenError(openData)) {
        return NextResponse.json({
          ok: false,
          error: "Slack authentication expired. Please reconnect your account.",
          requiresReauth: true
        }, { status: 401 });
      }
      
      return NextResponse.json({ error: openData.error }, { status: 500 });
    }

    targetChannelId = openData.channel.id;
  }

  // Send the message
  const sendRes = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      channel: targetChannelId,
      text
    })
  });

  const sendData = await sendRes.json();

  if (!sendData.ok) {
    // Check if this is a token-related error
    if (isTokenError(sendData)) {
      return NextResponse.json({
        ok: false,
        error: "Slack authentication expired. Please reconnect your account.",
        requiresReauth: true
      }, { status: 401 });
    }
    
    return NextResponse.json({ error: sendData.error }, { status: 500 });
  }

  return NextResponse.json({ 
    ok: true, 
    ts: sendData.ts,
    tempMessageId: tempMessageId 
  });
}

async function getConversationMessages(authUserId: string, channelId: string, cursor?: string | null, limit: number = 20) {
  const tokenData = await getValidSlackToken(authUserId);
  
  if (!tokenData) {
    return NextResponse.json({ ok: false, messages: [], error: 'Slack token not found or expired' }, { status: 404 });
  }

  const token = tokenData.access_token;
  const currentUserSlackId = tokenData.slack_user_id;

  // Build URL for fetching conversation history with pagination
  let historyUrl = `https://slack.com/api/conversations.history?channel=${channelId}&limit=${limit}`;
  if (cursor) {
    historyUrl += `&cursor=${cursor}`;
  }

  const historyRes = await fetch(historyUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const history = await historyRes.json();

  if (!history.ok) {
    // Check if this is a token-related error
    if (isTokenError(history)) {
      return NextResponse.json({ 
        ok: false, 
        messages: [], 
        error: "Slack authentication expired. Please reconnect your account.",
        requiresReauth: true
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      ok: false, 
      messages: [], 
      error: history.error || "Failed to fetch conversation history" 
    }, { status: 500 });
  }

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

  // Get last_read for this channel
  const infoRes = await fetch(`https://slack.com/api/conversations.info?channel=${channelId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const infoData = await infoRes.json();
  const lastRead = infoData.ok && infoData.channel?.last_read ? infoData.channel.last_read : "0";

  // Sort messages by timestamp in descending order (newest first)
  const conversation = allMessages
    .sort((a: any, b: any) => parseFloat(b.ts) - parseFloat(a.ts))
    .map((msg: any, i: number) => ({
      id: `${msg.ts}_${i}`,
      senderId: msg.user || 'system',
      sender: userMap[msg.user] || 'Unknown User',
      content: msg.text,
      timestamp: new Date(parseFloat(msg.ts) * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      ts: msg.ts,
      isIncoming: msg.user !== currentUserSlackId,
      unread: parseFloat(msg.ts) > parseFloat(lastRead),
    }));

  return NextResponse.json({ 
    ok: true, 
    messages: conversation,
    hasMore: !!history.response_metadata?.next_cursor,
    nextCursor: history.response_metadata?.next_cursor || null
  });
}