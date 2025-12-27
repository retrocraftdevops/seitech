import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketConfig {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface WebSocketEvents {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onUpvote?: (data: { type: 'discussion' | 'reply'; id: number; count: number }) => void;
  onReply?: (data: { discussion_id: number; reply: any }) => void;
  onViewCount?: (data: { discussion_id: number; count: number }) => void;
  onMemberJoin?: (data: { group_id: number; user_name: string; member_count: number }) => void;
  onStreakMilestone?: (data: { user_id: number; milestone: number; badge: string }) => void;
  onLeaderboardUpdate?: (data: { category: string; period: string }) => void;
  onNotification?: (data: { 
    type: string; 
    title: string; 
    message: string; 
    link?: string;
    data?: any;
  }) => void;
}

export function useWebSocket(events: WebSocketEvents, config: WebSocketConfig = {}) {
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef(events);

  // Update events ref when events change
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(config.url || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      autoConnect: config.autoConnect !== false,
      reconnection: config.reconnection !== false,
      reconnectionAttempts: config.reconnectionAttempts || 5,
      reconnectionDelay: config.reconnectionDelay || 1000,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('WebSocket connected');
      eventsRef.current.onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      eventsRef.current.onDisconnect?.();
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      eventsRef.current.onError?.(error as Error);
    });

    // Social learning events
    socket.on('discussion:upvote', (data) => {
      eventsRef.current.onUpvote?.(data);
    });

    socket.on('discussion:reply', (data) => {
      eventsRef.current.onReply?.(data);
    });

    socket.on('discussion:view', (data) => {
      eventsRef.current.onViewCount?.(data);
    });

    socket.on('study-group:join', (data) => {
      eventsRef.current.onMemberJoin?.(data);
    });

    socket.on('streak:milestone', (data) => {
      eventsRef.current.onStreakMilestone?.(data);
    });

    socket.on('leaderboard:update', (data) => {
      eventsRef.current.onLeaderboardUpdate?.(data);
    });

    socket.on('notification', (data) => {
      eventsRef.current.onNotification?.(data);
    });

    socketRef.current = socket;
  }, [config]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }, []);

  const subscribe = useCallback((room: string) => {
    emit('subscribe', { room });
  }, [emit]);

  const unsubscribe = useCallback((room: string) => {
    emit('unsubscribe', { room });
  }, [emit]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    subscribe,
    unsubscribe,
    isConnected: socketRef.current?.connected || false,
  };
}

// Helper hooks for specific features
export function useDiscussionSocket(discussionId: number, callbacks: {
  onUpvote?: (count: number) => void;
  onReply?: (reply: any) => void;
  onViewCount?: (count: number) => void;
}) {
  return useWebSocket({
    onUpvote: (data) => {
      if (data.type === 'discussion' && data.id === discussionId) {
        callbacks.onUpvote?.(data.count);
      }
    },
    onReply: (data) => {
      if (data.discussion_id === discussionId) {
        callbacks.onReply?.(data.reply);
      }
    },
    onViewCount: (data) => {
      if (data.discussion_id === discussionId) {
        callbacks.onViewCount?.(data.count);
      }
    },
  });
}

export function useStudyGroupSocket(groupId: number, callbacks: {
  onMemberJoin?: (data: { user_name: string; member_count: number }) => void;
}) {
  return useWebSocket({
    onMemberJoin: (data) => {
      if (data.group_id === groupId) {
        callbacks.onMemberJoin?.(data);
      }
    },
  });
}

export function useStreakSocket(userId: number, callbacks: {
  onMilestone?: (data: { milestone: number; badge: string }) => void;
}) {
  return useWebSocket({
    onStreakMilestone: (data) => {
      if (data.user_id === userId) {
        callbacks.onMilestone?.(data);
      }
    },
  });
}

export function useLeaderboardSocket(callbacks: {
  onUpdate?: (data: { category: string; period: string }) => void;
}) {
  return useWebSocket({
    onLeaderboardUpdate: callbacks.onUpdate,
  });
}

export function useNotificationSocket(callbacks: {
  onNotification?: (notification: {
    type: string;
    title: string;
    message: string;
    link?: string;
    data?: any;
  }) => void;
}) {
  return useWebSocket({
    onNotification: callbacks.onNotification,
  });
}
