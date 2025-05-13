'use client';
import { useEffect, useState } from 'react';
import {createClient} from "@/utils/supabase/client";
import { useAuth } from '../context/AuthProvider';

export default function SlackMessages() {
  const [dms, setDms] = useState<any[]>([]);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const supabase = createClient();
  const { user } = useAuth();

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     setAuthUserId(user?.id || null);
  //   };
  //   fetchUser();
  // }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user.id) return;
      const res = await fetch('/api/slack/messages', {
        headers: { 'x-user-id': user.id },
      });
      const data = await res.json();
      if (data.ok) {
        setDms(data.dms);
      }
    };
    fetchMessages();
  }, [user?.id]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Direct Messages</h1>
      {dms.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        dms.map((dm, i) => (
          <div key={i} className="mb-6">
            <h2 className="text-md font-semibold mb-2">Channel: {dm.channelId} {dm.channelName}</h2>
            {dm.messages.length > 0 ? (
              <ul className="space-y-2">
                {dm.messages.map((msg: any, j: number) => (
                  <li key={j} className="p-2 border rounded bg-gray-100">
                    {msg.text ? (
                      <div>
                        <strong className="text-sm">{msg.userName}</strong>
                        <span className="text-xs text-gray-500 ml-2">{new Date(msg.ts * 1000).toLocaleString()}</span>
                        <p>{msg.text}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No text available</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No messages in this channel.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
