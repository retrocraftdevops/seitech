'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { odooApi } from '@/lib/odoo-api';

interface Message {
  id: number;
  content: string;
  type: 'text' | 'file' | 'image' | 'system';
  author: {
    id: number | null;
    name: string;
    image: string | null;
  };
  created_at: string;
  is_read: boolean;
  attachments: Array<{
    id: number;
    name: string;
    mimetype: string;
    url: string;
  }>;
  reactions: Array<{
    emoji: string;
    user_id: number;
    user_name: string;
  }>;
  reply_count: number;
  parent_id: number | null;
}

interface Channel {
  id: number;
  name: string;
  type: 'public_support' | 'student_instructor' | 'student_support' | 'instructor_admin' | 'group' | 'course' | 'direct';
  unread_count: number;
  last_message_date: string | null;
  last_message_preview: string | null;
  member_count: number;
  course_id: number | null;
  course_name: string | null;
}

interface ChatContextType {
  channels: Channel[];
  activeChannel: Channel | null;
  messages: Message[];
  loading: boolean;
  setActiveChannel: (channel: Channel | null) => void;
  sendMessage: (content: string, parentId?: number) => Promise<void>;
  loadMessages: (channelId: number) => Promise<void>;
  createDirectChannel: (userId: number) => Promise<number>;
  createStudentInstructorChannel: (instructorId: number, courseId?: number) => Promise<number>;
  toggleReaction: (messageId: number, emoji: string) => Promise<void>;
  sendTypingIndicator: (channelId: number) => void;
  refreshChannels: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  const refreshChannels = useCallback(async () => {
    try {
      const response = await odooApi.post('/api/chat/channels', {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        setChannels(response.data.channels);
      }
    } catch (error: any) {
      // Silently fail for unauthenticated users (public support chat doesn't need channels)
      if (error?.response?.status !== 401) {
        console.error('Failed to load channels:', error);
      }
    }
  }, []);

  const loadMessages = useCallback(async (channelId: number) => {
    setLoading(true);
    try {
      const response = await odooApi.post('/api/chat/messages', {
        channel_id: channelId,
        limit: 50,
        offset: 0,
      });
      
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, parentId?: number) => {
    if (!activeChannel) return;

    try {
      const response = await odooApi.post('/api/chat/send', {
        channel_id: activeChannel.id,
        content,
        parent_id: parentId,
        message_type: 'text',
      });

      if (response.data.success) {
        // Add message to local state optimistically
        setMessages(prev => [...prev, response.data.message]);
        
        // Refresh channels to update unread counts
        refreshChannels();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [activeChannel, refreshChannels]);

  const createDirectChannel = useCallback(async (userId: number): Promise<number> => {
    try {
      const response = await odooApi.post('/api/chat/create-direct', {
        user_id: userId,
      });

      if (response.data.success) {
        await refreshChannels();
        return response.data.channel_id;
      }
      throw new Error('Failed to create channel');
    } catch (error) {
      console.error('Failed to create direct channel:', error);
      throw error;
    }
  }, [refreshChannels]);

  const createStudentInstructorChannel = useCallback(async (
    instructorId: number,
    courseId?: number
  ): Promise<number> => {
    try {
      const response = await odooApi.post('/api/chat/create-student-instructor', {
        instructor_id: instructorId,
        course_id: courseId,
      });

      if (response.data.success) {
        await refreshChannels();
        return response.data.channel_id;
      }
      throw new Error('Failed to create channel');
    } catch (error) {
      console.error('Failed to create student-instructor channel:', error);
      throw error;
    }
  }, [refreshChannels]);

  const toggleReaction = useCallback(async (messageId: number, emoji: string) => {
    try {
      await odooApi.post('/api/chat/reaction', {
        message_id: messageId,
        emoji,
      });

      // Update local message state
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id === messageId) {
            const hasReaction = msg.reactions.some(r => r.emoji === emoji);
            return {
              ...msg,
              reactions: hasReaction
                ? msg.reactions.filter(r => r.emoji !== emoji)
                : [...msg.reactions, { emoji, user_id: 0, user_name: 'You' }],
            };
          }
          return msg;
        })
      );
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  }, []);

  const sendTypingIndicator = useCallback((channelId: number) => {
    odooApi.post('/api/chat/typing', { channel_id: channelId }).catch(console.error);
  }, []);

  useEffect(() => {
    refreshChannels();
  }, [refreshChannels]);

  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel.id);
    }
  }, [activeChannel, loadMessages]);

  // Set up real-time updates via polling (or WebSocket if available)
  useEffect(() => {
    if (!activeChannel) return;

    const interval = setInterval(() => {
      loadMessages(activeChannel.id);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [activeChannel, loadMessages]);

  const value: ChatContextType = {
    channels,
    activeChannel,
    messages,
    loading,
    setActiveChannel,
    sendMessage,
    loadMessages,
    createDirectChannel,
    createStudentInstructorChannel,
    toggleReaction,
    sendTypingIndicator,
    refreshChannels,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
