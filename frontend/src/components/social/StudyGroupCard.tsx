'use client';

import React, { useState } from 'react';
import { StudyGroup } from '@/types/social';
import { 
  Users, Lock, Globe, Shield, Calendar, 
  MessageSquare, TrendingUp, Award, CheckCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StudyGroupCardProps {
  group: StudyGroup;
  onJoin?: (groupId: number) => void;
  onLeave?: (groupId: number) => void;
  onClick?: (groupId: number) => void;
}

export default function StudyGroupCard({ group, onJoin, onLeave, onClick }: StudyGroupCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [isMember, setIsMember] = useState(group.is_member || false);

  const getPrivacyIcon = () => {
    switch (group.privacy) {
      case 'public':
        return <Globe className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'secret':
        return <Shield className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getPrivacyColor = () => {
    switch (group.privacy) {
      case 'public':
        return 'bg-green-100 text-green-800';
      case 'private':
        return 'bg-yellow-100 text-yellow-800';
      case 'secret':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = () => {
    const colors: Record<string, string> = {
      course: 'bg-blue-100 text-blue-800',
      skill: 'bg-purple-100 text-purple-800',
      project: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[group.group_type] || 'bg-gray-100 text-gray-800';
  };

  const handleJoinLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsJoining(true);

    try {
      if (isMember) {
        const response = await fetch(`/api/study-groups/${group.id}/leave`, {
          method: 'POST',
        });

        if (response.ok) {
          setIsMember(false);
          if (onLeave) onLeave(group.id);
        }
      } else {
        const response = await fetch(`/api/study-groups/${group.id}/join`, {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          // Check if join requires approval
          if (data.member_status?.state === 'pending') {
            alert('Your request to join is pending approval');
          } else {
            setIsMember(true);
          }
          if (onJoin) onJoin(group.id);
        }
      }
    } catch (error) {
      console.error('Error joining/leaving group:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCardClick = () => {
    if (onClick) onClick(group.id);
  };

  const isFull = group.member_count >= group.max_members;

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer"
    >
      {/* Group Image */}
      <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
        {group.image_128 ? (
          <img
            src={`data:image/png;base64,${group.image_128}`}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        {group.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
            <Award className="h-3 w-3 mr-1" />
            Featured
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Group Header */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{group.name}</h3>
            {isMember && (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center ${getTypeColor()}`}>
              {group.group_type}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center ${getPrivacyColor()}`}>
              {getPrivacyIcon()}
              <span className="ml-1">{group.privacy}</span>
            </span>
          </div>
        </div>

        {/* Group Description */}
        {group.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>
        )}

        {/* Group Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {group.member_count}/{group.max_members}
            </div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <MessageSquare className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{group.discussion_count}</div>
            <div className="text-xs text-gray-500">Discussions</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{Math.round(group.progress_percentage)}%</div>
            <div className="text-xs text-gray-500">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${group.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Next Session */}
        {group.next_session && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center text-sm text-blue-900">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="font-semibold">Next session:</span>
              <span className="ml-1">
                {formatDistanceToNow(new Date(group.next_session.scheduled_date), { addSuffix: true })}
              </span>
            </div>
          </div>
        )}

        {/* Owner Info */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold mr-2">
              {group.owner_name?.charAt(0).toUpperCase()}
            </div>
            <span>by {group.owner_name}</span>
          </div>
          <span>{formatDistanceToNow(new Date(group.create_date), { addSuffix: true })}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleJoinLeave}
          disabled={isJoining || (!isMember && isFull)}
          className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 ${
            isMember
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : isFull
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          {isJoining
            ? 'Processing...'
            : isMember
            ? 'Leave Group'
            : isFull
            ? 'Group Full'
            : group.join_policy === 'open'
            ? 'Join Now'
            : 'Request to Join'}
        </button>
      </div>
    </div>
  );
}
