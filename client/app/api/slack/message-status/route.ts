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
      return NextResponse.json({ ok: false, error: 'Missing user ID' }, { status: 400 });
    }

    const url = new URL(req.url);
    const messageTs = url.searchParams.get('messageTs');
    const channelId = url.searchParams.get('channelId');

    if (!messageTs || !channelId) {
      return NextResponse.json({ ok: false, error: 'Missing messageTs or channelId' }, { status: 400 });
    }

    const { data: tokenRow, error } = await supabase
      .from('slack_tokens')
      .select('access_token, slack_user_id')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !tokenRow) {
      return NextResponse.json({ ok: false, error: 'Slack token not found' }, { status: 404 });
    }

    const token = tokenRow.access_token;

    // Get conversation history to check if there are newer messages (indicating the message was seen)
    const historyRes = await fetch(`https://slack.com/api/conversations.history?channel=${channelId}&oldest=${messageTs}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const historyData = await historyRes.json();

    if (!historyData.ok) {
      return NextResponse.json({ ok: false, error: historyData.error }, { status: 500 });
    }

    // Check if there are any messages from the other user after our message timestamp
    // This is a simple heuristic - in a real implementation, you might want to use Slack's read receipts API
    const messages = historyData.messages || [];
    const ourMessageIndex = messages.findIndex((msg: any) => msg.ts === messageTs);
    
    // If there are messages after ours from the other user, consider it "seen"
    const laterMessages = messages.slice(0, ourMessageIndex);
    const seen = laterMessages.some((msg: any) => msg.user !== tokenRow.slack_user_id);

    return NextResponse.json({ 
      ok: true, 
      seen,
      delivered: true // Messages are always delivered if they made it to Slack
    });

  } catch (error) {
    console.error('Error checking message status:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
