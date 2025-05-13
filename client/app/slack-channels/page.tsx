'use client';
import { useEffect, useState } from 'react';
import {createClient} from "@/utils/supabase/client"; 

export default function SlackChannels() {
  const [channels, setChannels] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const supabase = createClient();

   const [authUserId, setAuthUserId] = useState<string | null>(null);

   useEffect(() => {
      const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setAuthUserId(user?.id || null);
      };
      fetchUser();
    }, []); 
    
    useEffect(() => {
      if (!authUserId) return; // wait until authUserId is available
    
      const fetchChannels = async () => {
        const res = await fetch('/api/slack/channels', {
          headers: { 'x-user-id': authUserId },
        });
        const data = await res.json();
        if (data.ok) {
          setChannels(data.channels);
        }
      };
    
      fetchChannels();
    }, [authUserId]);

  const fetchMessages = async (channelId: string) => {
    setSelectedChannel(channelId);
    const res = await fetch(`/api/slack/messages?channel=${channelId}`, {
      headers: authUserId ? { 'x-user-id': authUserId } : undefined,
    });
    const data = await res.json();
    if (data.ok) {
      setMessages(data.messages);
    } else {
      setMessages([]);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Slack Channels</h1>
      <ul className="space-y-2 mb-6">
        {channels.map((ch) => (
          <li
            key={ch.id}
            className="cursor-pointer p-2 border rounded bg-white shadow-sm hover:bg-gray-100"
            onClick={() => fetchMessages(ch.id)}
          >
            #{ch.name}
          </li>
        ))}
      </ul>

      {selectedChannel && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Messages in #{selectedChannel}</h2>
          {messages.length > 0 ? (
            <ul className="space-y-2">
              {messages.map((msg, i) => (
                <li key={i} className="p-2 border rounded bg-gray-50">
                  {msg.text || <em>(no text)</em>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No messages found or failed to fetch.</p>
          )}
        </div>
      )}
    </div>
  );
}
