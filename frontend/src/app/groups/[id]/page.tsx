'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Users, Calendar, Clock, Video, MessageSquare, 
  Settings, LogOut, UserPlus, Shield, Crown, User 
} from 'lucide-react';
import StudyGroupChat from '@/components/social/StudyGroupChat';
import { StudyGroup, StudyGroupMember } from '@/types/social';

export default function GroupDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const groupId = parseInt(params.id);

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<StudyGroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchGroupData();
    fetchMembers();
    checkMembership();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const response = await fetch(`/api/study-groups/${groupId}`);
      const data = await response.json();
      setGroup(data);
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/study-groups/${groupId}/members`);
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    try {
      const response = await fetch(`/api/study-groups/${groupId}/check-membership`);
      const data = await response.json();
      setIsMember(data.is_member);
      setCurrentUserId(data.user_id);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await fetch(`/api/study-groups/${groupId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsMember(true);
        fetchGroupData();
        fetchMembers();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      const response = await fetch(`/api/study-groups/${groupId}/leave`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsMember(false);
        fetchGroupData();
        fetchMembers();
      }
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h2>
          <p className="text-gray-600 mb-6">The study group you're looking for doesn't exist.</p>
          <Link
            href="/groups"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="container mx-auto px-6">
          <Link
            href="/groups"
            className="inline-flex items-center text-white hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Groups
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
              <p className="text-lg opacity-90">{group.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <span className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  {group.member_count} / {group.max_members || '∞'} members
                </span>
                <span className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {'Flexible schedule'}
                </span>
              </div>
            </div>
            <div>
              {!isMember ? (
                <button
                  onClick={handleJoinGroup}
                  className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Join Group
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleLeaveGroup}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Leave Group
                  </button>
                  {members.find(m => m.user_id === currentUserId && ['owner', 'moderator'].includes(m.role)) && (
                    <button
                      onClick={() => router.push(`/groups/${groupId}/settings`)}
                      className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <Settings className="h-5 w-5 mr-2" />
                      Settings
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Session */}
            {group.next_session && (
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-sm p-6 text-white">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Video className="h-6 w-6 mr-2" />
                  Next Session
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{(group.next_session as any)?.title || "Next Session"}</p>
                    <p className="flex items-center mt-2 opacity-90">
                      <Calendar className="h-5 w-5 mr-2" />
                      {new Date((group.next_session as any)?.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="flex items-center mt-1 opacity-90">
                      <Clock className="h-5 w-5 mr-2" />
                      {(group.next_session as any)?.time || ""}
                    </p>
                  </div>
                  <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Join Session
                  </button>
                </div>
              </div>
            )}

            {/* Group Chat */}
            {isMember && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2" />
                  Group Chat
                </h2>
                <StudyGroupChat groupId={groupId} />
              </div>
            )}

            {!isMember && (
              <div className="bg-gray-100 rounded-xl p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Join to Access Group Chat</h3>
                <p className="text-gray-600 mb-6">Become a member to participate in discussions and chat with the group.</p>
                <button
                  onClick={handleJoinGroup}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors inline-flex items-center"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Join Group
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Group Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Group Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{group.group_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Privacy</p>
                  <p className="font-semibold text-gray-900 capitalize">{group.privacy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Join Policy</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {group.join_policy.replace('_', ' ')}
                  </p>
                </div>
                {(group as any).related_course || group.course_id && (
                  <div>
                    <p className="text-sm text-gray-600">Related Course</p>
                    <Link
                      href={`/courses/${(group as any).related_course || group.course_id}`}
                      className="font-semibold text-purple-600 hover:text-purple-700"
                    >
                      {(group as any).related_course || group.course_name || "Course"}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Members */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Members ({members.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    {member.user_avatar || "" ? (
                      <img
                        src={member.user_avatar || ""}
                        alt={member.user_name || "Unknown"}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {member.user_name || "Unknown".charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm flex items-center">
                        {member.user_name || "Unknown"}
                        <span className="ml-2">{getRoleIcon(member.role)}</span>
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            {(group as any).progress || group.progress_percentage !== undefined && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Group Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overall Completion</span>
                    <span className="font-semibold text-gray-900">{(group as any).progress || group.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(group as any).progress || group.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
