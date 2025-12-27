'use client';

import React, { useState } from 'react';
import { ChatProvider } from './ChatContext';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { MessageCircle, X, Maximize2, Minimize2 } from 'lucide-react';

interface ChatInterfaceProps {
  mode?: 'sidebar' | 'floating' | 'fullscreen';
  defaultOpen?: boolean;
}

export function ChatInterface({ mode = 'floating', defaultOpen = false }: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);

  if (mode === 'sidebar') {
    return (
      <ChatProvider>
        <div className="flex h-screen">
          <ChatSidebar />
          <div className="flex-1">
            <ChatWindow />
          </div>
        </div>
      </ChatProvider>
    );
  }

  if (mode === 'fullscreen') {
    return (
      <ChatProvider>
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex h-full">
            <ChatSidebar />
            <div className="flex-1">
              <ChatWindow onClose={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      </ChatProvider>
    );
  }

  // Floating mode (default)
  return (
    <ChatProvider>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl transition-all ${
            isMinimized
              ? 'w-80 h-16'
              : 'w-96 h-[600px] lg:w-[480px] lg:h-[680px]'
          }`}
          style={{
            maxHeight: 'calc(100vh - 3rem)',
          }}
        >
          {isMinimized ? (
            <div className="h-full flex items-center justify-between px-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary-600" />
                </div>
                <span className="font-medium text-gray-900">Messages</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Maximize2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex">
              <div className="w-1/3 border-r border-gray-200">
                <ChatSidebar />
              </div>
              <div className="flex-1">
                <ChatWindow
                  onClose={() => setIsOpen(false)}
                  onToggleMinimize={() => setIsMinimized(!isMinimized)}
                  isMinimized={isMinimized}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </ChatProvider>
  );
}

export default ChatInterface;
