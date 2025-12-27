'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from './ChatContext';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  X,
  Minimize2,
  Maximize2,
  Phone,
  Video,
  MoreVertical,
  Search,
} from 'lucide-react';

interface ChatWindowProps {
  channelId?: number;
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export function ChatWindow({
  channelId,
  onClose,
  isMinimized,
  onToggleMinimize,
}: ChatWindowProps) {
  const { activeChannel, messages, loading, sendMessage, sendTypingIndicator } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;

    try {
      await sendMessage(messageInput);
      setMessageInput('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);

    // Send typing indicator
    if (activeChannel) {
      sendTypingIndicator(activeChannel.id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!activeChannel) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
          <p className="text-sm text-gray-500">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{activeChannel.name}</h4>
            <p className="text-xs text-gray-500">Click to expand</p>
          </div>
        </div>
        <button
          onClick={onToggleMinimize}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Maximize2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{activeChannel.name}</h3>
            <p className="text-xs text-gray-500">
              {activeChannel.type === 'direct' ? 'Direct message' : activeChannel.type}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.author.id !== null;
            const showAvatar = index === 0 || messages[index - 1].author.id !== message.author.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                  showAvatar ? 'mt-4' : 'mt-1'
                }`}
              >
                <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
                  {showAvatar && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      {message.author.image ? (
                        <img
                          src={`data:image/png;base64,${message.author.image}`}
                          alt={message.author.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-600">
                          {message.author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={showAvatar ? '' : 'ml-10'}>
                    {showAvatar && !isOwnMessage && (
                      <p className="text-xs text-gray-500 mb-1 px-3">{message.author.name}</p>
                    )}
                    
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      
                      {message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map(att => (
                            <a
                              key={att.id}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-xs underline"
                            >
                              <Paperclip className="w-3 h-3" />
                              <span>{att.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1 px-3">
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                      
                      {message.reactions.length > 0 && (
                        <div className="flex space-x-1">
                          {message.reactions.map((reaction, i) => (
                            <span key={i} className="text-xs">
                              {reaction.emoji}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full bg-transparent border-none focus:outline-none resize-none text-sm text-gray-900 placeholder-gray-500"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            type="button"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
