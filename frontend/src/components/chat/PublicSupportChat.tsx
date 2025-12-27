'use client';

import React, { useState, useEffect, useRef } from 'react';
import { odooApi } from '@/lib/odoo-api';
import { MessageCircle, Send, X, Paperclip, Image as ImageIcon, FileText, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  author_name: string;
  created_at: string;
  is_agent: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
}

export function PublicSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    if (!userName.trim()) {
      console.warn('Cannot initialize chat without a name');
      setConnectionError('Please enter your name');
      return;
    }

    try {
      setIsInitializing(true);
      setLoading(true);
      setConnectionError(null);
      
      const response = await odooApi.post('/api/chat/support', {
        name: userName.trim(),
        email: userEmail.trim() || undefined,
      });

      if (response.data.success) {
        setChannelId(response.data.channel_id);
        setSessionToken(response.data.session_token);
        setIsConnected(true);
        setConnectionError(null);
        
        // Store in localStorage for persistence
        localStorage.setItem('support_channel_id', response.data.channel_id.toString());
        localStorage.setItem('support_session_token', response.data.session_token);
        if (userName) localStorage.setItem('support_user_name', userName);
        if (userEmail) localStorage.setItem('support_user_email', userEmail);
        
        // Load existing messages if any
        await loadMessages(response.data.channel_id, response.data.session_token);
      } else {
        console.error('Chat initialization failed:', response.data);
        setIsConnected(false);
        setConnectionError(response.data.error || 'Failed to connect. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to initialize chat:', error);
      setIsConnected(false);
      
      // Show user-friendly error message
      let errorMessage = '';
      if (error?.response?.data?.error) {
        const apiError = error.response.data.error;
        if (apiError.includes('does not exist') || apiError.includes('relation')) {
          errorMessage = 'Chat service is not configured. The database tables need to be created. Please install/upgrade the chat module in Odoo.';
        } else {
          errorMessage = `Server error: ${apiError}`;
        }
      } else if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to server. Please ensure the Odoo backend is running on http://localhost:8069';
      } else if (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection and ensure the backend server is running.';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Chat API endpoint not found. The chat module may not be installed.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (error?.message) {
        errorMessage = `Connection error: ${error.message}`;
      } else {
        errorMessage = 'Unable to connect to chat service. Please try again later.';
      }
      setConnectionError(errorMessage);
    } finally {
      setLoading(false);
      setIsInitializing(false);
    }
  };

  const loadMessages = async (cId: number, token: string) => {
    try {
      const response = await odooApi.get(`/api/chat/support/${cId}/messages`, {
        headers: { 'X-Session-Token': token },
      });
      
      if (response.data.success && response.data.messages) {
        setMessages(response.data.messages);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw error;
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !channelId || !sessionToken) return;

    const currentMessage = messageInput;
    const tempId = Date.now();
    setMessageInput(''); // Clear immediately for better UX

    // Add optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      content: currentMessage,
      author_name: userName || 'Guest',
      created_at: new Date().toISOString(),
      is_agent: false,
      status: 'sending',
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await odooApi.post('/api/chat/support/send', {
        channel_id: channelId,
        content: currentMessage,
        session_token: sessionToken,
        author_name: userName || 'Guest',
      });

      if (response.data.success) {
        // Update message with real ID and status
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? { ...msg, id: response.data.message_id, status: 'sent' as const }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove failed message and restore input
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setMessageInput(currentMessage);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!channelId || !sessionToken) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('channel_id', channelId.toString());
    formData.append('session_token', sessionToken);

    try {
      const response = await odooApi.post('/api/chat/support/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setMessages(prev => [
          ...prev,
          {
            id: response.data.message_id,
            content: `Sent a file: ${file.name}`,
            author_name: userName || 'Guest',
            created_at: new Date().toISOString(),
            is_agent: false,
            attachment: {
              name: file.name,
              url: response.data.file_url,
              type: file.type,
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
    
    setShowAttachmentMenu(false);
  };

  const handleOpen = () => {
    console.log('Chat widget opening...', { isOpen, isConnected, userName });
    setIsOpen(true);
    setUnreadCount(0); // Clear unread when opening
    setConnectionError(null); // Clear any previous errors when opening
    if (!isConnected && userName && channelId && sessionToken) {
      // If we have stored credentials, try to restore connection
      loadMessages(channelId, sessionToken)
        .then(() => setIsConnected(true))
        .catch(() => {
          // If restore fails, clear stored data and show form
          localStorage.removeItem('support_channel_id');
          localStorage.removeItem('support_session_token');
          setChannelId(null);
          setSessionToken(null);
        });
    }
  };

  // Poll for new messages
  useEffect(() => {
    if (!channelId || !sessionToken || !isConnected) return;

    const interval = setInterval(async () => {
      try {
        const response = await odooApi.get(`/api/chat/support/${channelId}/poll`, {
          params: { 
            session_token: sessionToken,
            last_message_id: messages[messages.length - 1]?.id || 0,
          },
        });

        if (response.data.success && response.data.messages?.length > 0) {
          setMessages(prev => [...prev, ...response.data.messages]);
          
          // Increment unread if chat is closed
          if (!isOpen && response.data.messages.some((m: Message) => m.is_agent)) {
            setUnreadCount(prev => prev + response.data.messages.filter((m: Message) => m.is_agent).length);
          }
          
          // Check if agent is typing
          if (response.data.is_typing) {
            setIsAgentTyping(true);
            setTimeout(() => setIsAgentTyping(false), 3000);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [channelId, sessionToken, isConnected, messages, isOpen]);

  // Restore session from localStorage
  useEffect(() => {
    const storedChannelId = localStorage.getItem('support_channel_id');
    const storedToken = localStorage.getItem('support_session_token');
    const storedName = localStorage.getItem('support_user_name');
    const storedEmail = localStorage.getItem('support_user_email');

    if (storedChannelId && storedToken && storedName) {
      // Only restore if we have all required data
      setChannelId(parseInt(storedChannelId));
      setSessionToken(storedToken);
      setUserName(storedName);
      if (storedEmail) setUserEmail(storedEmail);
      
      // Try to verify the session is still valid by loading messages
      loadMessages(parseInt(storedChannelId), storedToken)
        .then(() => {
          setIsConnected(true);
        })
        .catch((error) => {
          console.error('Failed to restore session:', error);
          // Clear invalid session data
          localStorage.removeItem('support_channel_id');
          localStorage.removeItem('support_session_token');
          setChannelId(null);
          setSessionToken(null);
          setIsConnected(false);
        });
    }
  }, []);

  // Debug: Log state changes (only when opening/closing or connection changes)
  useEffect(() => {
    if (isOpen) {
      console.log('Chat widget opened:', { isConnected, hasChannel: channelId !== null, hasName: !!userName });
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (isConnected !== undefined) {
      console.log('Connection status changed:', { isConnected, hasChannel: channelId !== null });
    }
  }, [isConnected, channelId]);

  return (
    <>
      {/* Floating Support Button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </div>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[100] w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 3rem)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Support Chat</h3>
              <p className="text-xs text-primary-100 flex items-center gap-1">
                {loading || isInitializing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Connecting...
                  </span>
                ) : isConnected && channelId ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Online - We'll respond shortly
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    {userName ? 'Click "Start Chatting" to connect' : 'Enter your name to start'}
                  </span>
                )}
              </p>
              {connectionError && (
                <p className="text-xs text-yellow-200 mt-1 px-1">
                  {connectionError}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info Form (show if not connected and have name, or if no name set) */}
          {(!isConnected && !isInitializing) && (
            <div className="bg-primary-50 border-b border-primary-100 p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Let's get started! Tell us about you:
              </h4>
              {connectionError && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  {connectionError}
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setConnectionError(null); // Clear error when retrying
                    initializeChat();
                  }}
                  disabled={!userName.trim() || isInitializing || loading}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isInitializing || loading ? 'Connecting...' : connectionError ? 'Retry Connection' : 'Start Chatting'}
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loading && !isConnected ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="mt-2 text-sm text-gray-500">Connecting to support...</p>
                </div>
              </div>
            ) : !isConnected && connectionError ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageCircle className="w-12 h-12 text-gray-400 mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Connection Failed</h4>
                <p className="text-sm text-gray-600 mb-4 px-4">{connectionError}</p>
                <button
                  onClick={() => {
                    setConnectionError(null);
                    if (userName) initializeChat();
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : messages.length === 0 && isConnected ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mb-3" />
                <h4 className="font-medium text-gray-900 mb-1">Welcome to Support!</h4>
                <p className="text-sm text-gray-500 px-8">
                  Ask us anything. Our team is here to help you.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_agent ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[80%]`}>
                      {message.is_agent && (
                        <p className="text-xs text-gray-500 mb-1 px-3">
                          {message.author_name}
                        </p>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.is_agent
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'bg-primary-600 text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {message.attachment && (
                          <a
                            href={message.attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-2 text-xs underline"
                          >
                            {message.attachment.type.startsWith('image/') ? (
                              <ImageIcon className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                            <span>{message.attachment.name}</span>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-3">
                        <p className="text-xs text-gray-400">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {!message.is_agent && message.status && (
                          <span className="text-xs text-gray-400">
                            {message.status === 'sending' && '○'}
                            {message.status === 'sent' && <Check className="w-3 h-3" />}
                            {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                            {message.status === 'read' && <CheckCheck className="w-3 h-3 text-primary-600" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isAgentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <form 
              onSubmit={sendMessage} 
              className="flex items-end space-x-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (messageInput.trim() && isConnected && userName) {
                        sendMessage();
                      }
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={!isConnected || !userName || loading}
                  autoFocus
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  disabled={!isConnected || !userName}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </button>
                
                {showAttachmentMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-600" />
                      Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachmentMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-gray-600" />
                      Upload Document
                    </button>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              
              <button
                type="submit"
                disabled={!messageInput.trim() || !isConnected || !userName || loading}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isConnected 
                ? 'Typically replies in a few minutes' 
                : userName 
                  ? 'Click "Start Chatting" to connect' 
                  : 'Enter your name to start chatting'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default PublicSupportChat;
