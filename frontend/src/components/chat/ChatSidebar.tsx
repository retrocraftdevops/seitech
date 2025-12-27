'use client';

import React, { useState } from 'react';
import { useChat } from './ChatContext';
import { MessageCircle, X, Search, Users, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ChatSidebar() {
  const { channels, activeChannel, setActiveChannel, refreshChannels } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || channel.type === filterType;
    return matchesSearch && matchesType;
  });

  const channelTypes = [
    { value: 'all', label: 'All Chats', icon: MessageCircle },
    { value: 'direct', label: 'Direct Messages', icon: User },
    { value: 'student_instructor', label: 'Instructors', icon: Users },
    { value: 'group', label: 'Study Groups', icon: Users },
    { value: 'course', label: 'Courses', icon: MessageCircle },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={refreshChannels}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Channel Type Filter */}
      <div className="px-4 py-2 border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-2">
          {channelTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setFilterType(type.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterType === type.value
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery ? 'Try a different search' : 'Start a new conversation'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  activeChannel?.id === channel.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {channel.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {channel.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {channel.unread_count > 9 ? '9+' : channel.unread_count}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate text-sm">
                        {channel.name}
                      </h4>
                      {channel.last_message_date && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(channel.last_message_date), {
                            addSuffix: false,
                          })}
                        </span>
                      )}
                    </div>

                    {channel.last_message_preview && (
                      <p className="text-xs text-gray-500 truncate">
                        {channel.last_message_preview}
                      </p>
                    )}

                    {channel.course_name && (
                      <p className="text-xs text-primary-600 mt-1">
                        Course: {channel.course_name}
                      </p>
                    )}

                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                        {channel.type.replace('_', ' ')}
                      </span>
                      {channel.member_count > 2 && (
                        <span className="text-xs text-gray-500">
                          {channel.member_count} members
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
