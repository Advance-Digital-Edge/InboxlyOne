import { useEffect, useState } from "react";
import { transformInstagramData } from "../utils/transformData";

const useMessages = (currentUserId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Gmail messages
  const fetchGmailMessages = async () => {
    // ...existing Gmail fetching logic
  };

  // Fetch Messenger messages
  const fetchMessengerMessages = async () => {
    // ...existing Messenger fetching logic
  };

  // In your useMessages hook, add Instagram fetching:
  const fetchInstagramMessages = async () => {
    try {
      console.log("🔄 Fetching Instagram messages...");
      const response = await fetch("/api/instagram/messages");
      const data = await response.json();
      
      console.log("📱 Instagram API response:", data);
      
      if (data.success && data.conversations.length > 0) {
        // Transform Instagram data using your utility function
        const transformedData = transformInstagramData(data.conversations, currentUserId);
        console.log("📱 Transformed Instagram data:", transformedData);
        return transformedData;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching Instagram messages:", error);
      return [];
    }
  };

  // In your main useEffect where you fetch all messages:
  useEffect(() => {
    const fetchAllMessages = async () => {
      setLoading(true);
      console.log("🔄 Fetching all messages...");
      
      const [gmailData, messengerData, instagramData] = await Promise.all([
        fetchGmailMessages(),
        fetchMessengerMessages(),
        fetchInstagramMessages() // Add this line
      ]);

      console.log("📧 Gmail data:", gmailData);
      console.log("💬 Messenger data:", messengerData);
      console.log("📱 Instagram data:", instagramData);

      const combinedMessages = [
        ...gmailData,
        ...messengerData,
        ...instagramData // Add this line
      ].sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts));

      console.log("📋 Combined messages:", combinedMessages);
      setMessages(combinedMessages);
      setLoading(false);
    };

    fetchAllMessages();
  }, []);

  return { messages, loading };
};

export default useMessages;