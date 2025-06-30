'use client';
import { useEffect, useState } from 'react';
import {createClient} from "@/utils/supabase/client";
import { useAuth } from '../context/AuthProvider';

export default function SlackMessages() {
  const [dms, setDms] = useState<any[]>([]);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [messageStatuses, setMessageStatuses] = useState<Map<string, MessageStatus>>(new Map());
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

  // Function to send a message with status tracking
  const sendMessage = async (channelId: string, text: string) => {
    if (!user?.id || !text.trim()) return;

    const tempMessageId = `temp_${Date.now()}`;
    
    // Set status to sending
    setMessageStatuses(prev => new Map(prev.set(tempMessageId, 'sending')));
    
    try {
      const res = await fetch('/api/slack/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          channelId,
          text,
          tempMessageId,
        }),
      });
      
      const data = await res.json();
      
      if (data.ok) {
        // Update status to delivered
        setMessageStatuses(prev => new Map(prev.set(tempMessageId, 'delivered')));
        
        // Check if message was seen after a delay
        setTimeout(() => {
          checkMessageSeenStatus(tempMessageId, data.ts, channelId);
        }, 2000);
        
        // Refresh messages to show the new message
        const refreshRes = await fetch('/api/slack/messages', {
          headers: { 'x-user-id': user.id },
        });
        const refreshData = await refreshRes.json();
        if (refreshData.ok) {
          setDms(refreshData.dms);
        }
      } else {
        // Set status to failed
        setMessageStatuses(prev => new Map(prev.set(tempMessageId, 'failed')));
        console.error('Failed to send message:', data.error);
      }
    } catch (error) {
      // Set status to failed
      setMessageStatuses(prev => new Map(prev.set(tempMessageId, 'failed')));
      console.error('Error sending message:', error);
    }
  };

  // Check if message has been seen
  const checkMessageSeenStatus = async (tempMessageId: string, messageTs: string, channelId: string) => {
    try {
      const res = await fetch(`/api/slack/message-status?messageTs=${messageTs}&channelId=${channelId}`, {
        headers: { 'x-user-id': user?.id || '' },
      });
      
      const data = await res.json();
      
      if (data.ok && data.seen) {
        setMessageStatuses(prev => new Map(prev.set(tempMessageId, 'seen')));
      }
    } catch (error) {
      console.error('Error checking message status:', error);
    }
  };

  // Function to get status icon
  const getStatusIcon = (messageId: string) => {
    const status = messageStatuses.get(messageId);
    switch (status) {
      case 'sending':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'seen':
        return '✓✓';
      case 'failed':
        return '❌';
      default:
        return '';
    }
  };

  // Function to get status color
  const getStatusColor = (messageId: string) => {
    const status = messageStatuses.get(messageId);
    switch (status) {
      case 'sending':
        return 'text-gray-400';
      case 'delivered':
        return 'text-gray-400';
      case 'seen':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return '';
    }
  };

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
              <div className="space-y-2">
                <ul className="space-y-2">
                  {dm.messages.map((msg: any, j: number) => (
                    <li key={j} className="p-3 border rounded bg-gray-100 relative">
                      {msg.text ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <strong className="text-sm">{msg.userName}</strong>
                              <span className="text-xs text-gray-500 ml-2">{new Date(msg.ts * 1000).toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="pr-8">{msg.text}</p>
                          {/* Status indicator in bottom right */}
                          <div className={`absolute bottom-2 right-2 text-xs ${getStatusColor(msg.ts)}`}>
                            {getStatusIcon(msg.ts)}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No text available</p>
                      )}
                    </li>
                  ))}
                </ul>
                
                {/* Message sending form */}
                <div className="mt-4 p-3 border-t bg-gray-50 rounded">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const text = formData.get('message') as string;
                    if (text.trim()) {
                      sendMessage(dm.channelId, text);
                      e.currentTarget.reset();
                    }
                  }}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="message"
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No messages in this channel.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
