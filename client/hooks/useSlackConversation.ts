import { useState, useCallback, useRef } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

interface SlackMessage {
  id: string;
  senderId: string;
  sender: string;
  content: string;
  timestamp: string;
  ts: string;
  isIncoming: boolean;
  unread: boolean;
}

interface ConversationResponse {
  ok: boolean;
  messages: SlackMessage[];
  hasMore: boolean;
  nextCursor: string | null;
  error?: string;
}

export function useSlackConversation(userId: string | undefined, channelId: string | undefined) {
  const queryClient = useQueryClient();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchConversationPage = async ({ pageParam }: { pageParam?: string }) => {
    if (!userId || !channelId) {
      throw new Error('Missing userId or channelId');
    }

    const url = new URL('/api/slack/messages', window.location.origin);
    url.searchParams.set('channelId', channelId);
    url.searchParams.set('limit', '20');
    if (pageParam) {
      url.searchParams.set('cursor', pageParam);
    }

    const response = await fetch(url.toString(), {
      headers: { 'x-user-id': userId },
    });

    const data: ConversationResponse = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch conversation');
    }

    return data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['slackConversation', userId, channelId],
    queryFn: fetchConversationPage,
    enabled: !!userId && !!channelId,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 30, // 30 seconds cache
    refetchOnWindowFocus: false,
    refetchInterval: 3000, // Poll every 3 seconds for new messages in open conversation
  });

  // Flatten all pages into a single array of messages
  // Reverse pages order (older messages first) and reverse individual page messages (oldest to newest)
  const messages = data?.pages
    .slice()
    .reverse() // Reverse pages so older pages come first
    .flatMap(page => page.messages.slice().reverse()) || []; // Reverse each page so oldest messages come first

  const loadMoreMessages = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage && !isLoadingMore) {
      setIsLoadingMore(true);
      try {
        // Save current scroll position relative to the bottom
        const container = scrollContainerRef.current;
        const scrollBottom = container ? container.scrollHeight - container.scrollTop : 0;
        
        await fetchNextPage();
        
        // Restore scroll position after new messages are loaded
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - scrollBottom;
          }
        }, 100);
      } catch (err) {
        console.error('Failed to load more messages:', err);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [hasNextPage, isFetchingNextPage, isLoadingMore, fetchNextPage]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    // Check if user scrolled to the top (or near the top)
    if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasNextPage, isFetchingNextPage, isLoadingMore, loadMoreMessages]);

  const invalidateConversation = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['slackConversation', userId, channelId] });
  }, [queryClient, userId, channelId]);

  return {
    messages,
    isLoading,
    isLoadingMore: isLoadingMore || isFetchingNextPage,
    hasMoreMessages: hasNextPage,
    error,
    loadMoreMessages,
    handleScroll,
    scrollContainerRef,
    invalidateConversation,
  };
}