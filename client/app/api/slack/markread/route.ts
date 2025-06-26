import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const authUserId = req.headers.get('x-user-id');
    if (!authUserId) {
      return NextResponse.json({ ok: false, error: 'Missing user ID' }, { status: 400 });
    }

    const body = await req.json();
    const { messageId, channelId, timestamp } = body;

    if (!messageId || !channelId || !timestamp) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Missing required fields: messageId, channelId, or timestamp' 
      }, { status: 400 });
    }

    // Get Slack token
    const { data: tokenRow, error } = await supabase
      .from('slack_tokens')
      .select('access_token, slack_user_id')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !tokenRow) {
      return NextResponse.json({ ok: false, error: 'Slack token not found' }, { status: 404 });
    }

    const token = tokenRow.access_token;

    // Use Slack's conversations.mark API to mark the channel as read up to this timestamp
    const markReadRes = await fetch('https://slack.com/api/conversations.mark', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: channelId,
        ts: timestamp,
      }),
    });

    const markReadData = await markReadRes.json();

    if (!markReadData.ok) {
      console.error('Slack API error:', markReadData.error);
      return NextResponse.json({ 
        ok: false, 
        error: markReadData.error || 'Failed to mark message as read' 
      }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: 'Message marked as read' });

  } catch (error: any) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
