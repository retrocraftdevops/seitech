'use client';

import React, { useState, useEffect } from 'react';
import { Discussion, DiscussionReply, CreateReplyRequest } from '@/types/social';
import { 
  ThumbsUp, MessageSquare, Eye, Award, Pin, Lock, 
  Flag, Clock, User, Send, MoreVertical 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DiscussionThreadProps {
  discussionId: number;
  onReplyAdded?: () => void;
}

export default function DiscussionThread({ discussionId, onReplyAdded }: DiscussionThreadProps) {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussion();
    fetchReplies();
  }, [discussionId]);

  const fetchDiscussion = async () => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}`);
      if (response.ok) {
        const data = await response.json();
        setDiscussion(data);
      }
    } catch (error) {
      console.error('Error fetching discussion:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}/replies`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleUpvote = async () => {
    if (!discussion) return;

    try {
      const response = await fetch(`/api/discussions/${discussionId}/upvote`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setDiscussion({
          ...discussion,
          upvote_count: data.upvote_count,
          has_upvoted: data.has_upvoted,
        });
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleReplyUpvote = async (replyId: number) => {
    try {
      const response = await fetch(`/api/discussions/${discussionId}/replies/${replyId}/upvote`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchReplies(); // Refresh replies
      }
    } catch (error) {
      console.error('Error upvoting reply:', error);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const body: CreateReplyRequest = {
        discussion_id: discussionId,
        content: replyContent,
        parent_id: replyingTo || undefined,
      };

      const response = await fetch(`/api/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setReplyContent('');
        setReplyingTo(null);
        await fetchReplies();
        if (onReplyAdded) onReplyAdded();
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      question: 'bg-blue-100 text-blue-800',
      discussion: 'bg-purple-100 text-purple-800',
      announcement: 'bg-yellow-100 text-yellow-800',
      resource: 'bg-green-100 text-green-800',
      feedback: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderReply = (reply: DiscussionReply, depth: number = 0) => {
    const maxDepth = 5;
    const canNest = depth < maxDepth;

    return (
      <div key={reply.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'} border-l-2 ${reply.is_best_answer ? 'border-green-500' : 'border-gray-200'} pl-4`}>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {/* Reply Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                {reply.author_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{reply.author_name}</span>
                  {reply.is_by_instructor && (
                    <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                      Instructor
                    </span>
                  )}
                  {reply.is_by_author && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Author
                    </span>
                  )}
                  {reply.is_best_answer && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                      <Award className="h-3 w-3 mr-1" />
                      Best Answer
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(reply.create_date), { addSuffix: true })}</span>
                  {reply.edited_date && <span className="text-xs">(edited)</span>}
                </div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Reply Content */}
          <div className="prose prose-sm max-w-none mb-3" dangerouslySetInnerHTML={{ __html: reply.content }} />

          {/* Reply Actions */}
          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => handleReplyUpvote(reply.id)}
              className={`flex items-center space-x-1 ${
                reply.has_upvoted ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${reply.has_upvoted ? 'fill-current' : ''}`} />
              <span>{reply.upvote_count}</span>
            </button>
            {canNest && (
              <button
                onClick={() => setReplyingTo(reply.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-600"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Reply</span>
              </button>
            )}
            {reply.state === 'flagged' && (
              <span className="flex items-center space-x-1 text-red-600">
                <Flag className="h-4 w-4" />
                <span>Flagged</span>
              </span>
            )}
          </div>

          {/* Nested Reply Form */}
          {replyingTo === reply.id && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${reply.author_name}...`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-2">
            {reply.replies.map(nestedReply => renderReply(nestedReply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-12 text-gray-500">
        Discussion not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Discussion Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(discussion.category)}`}>
                {discussion.category}
              </span>
              {discussion.is_pinned && (
                <Pin className="h-4 w-4 text-yellow-600" />
              )}
              {discussion.is_locked && (
                <Lock className="h-4 w-4 text-gray-600" />
              )}
              {discussion.has_best_answer && (
                <Award className="h-4 w-4 text-green-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{discussion.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{discussion.author_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatDistanceToNow(new Date(discussion.create_date), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discussion Content */}
        <div className="prose prose-lg max-w-none mb-6" dangerouslySetInnerHTML={{ __html: discussion.content }} />

        {/* Discussion Stats */}
        <div className="flex items-center space-x-6 py-4 border-t border-gray-200">
          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-2 ${
              discussion.has_upvoted ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <ThumbsUp className={`h-5 w-5 ${discussion.has_upvoted ? 'fill-current' : ''}`} />
            <span className="font-semibold">{discussion.upvote_count}</span>
            <span className="text-sm">Upvotes</span>
          </button>
          <div className="flex items-center space-x-2 text-gray-600">
            <MessageSquare className="h-5 w-5" />
            <span className="font-semibold">{discussion.reply_count}</span>
            <span className="text-sm">Replies</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Eye className="h-5 w-5" />
            <span className="font-semibold">{discussion.view_count}</span>
            <span className="text-sm">Views</span>
          </div>
        </div>
      </div>

      {/* Reply Form */}
      {!discussion.is_locked && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add a Reply</h3>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmitReply}
              disabled={submitting || !replyContent.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>{submitting ? 'Posting...' : 'Post Reply'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          {discussion.reply_count} {discussion.reply_count === 1 ? 'Reply' : 'Replies'}
        </h3>
        {replies.length > 0 ? (
          <div className="space-y-4">
            {replies.map(reply => renderReply(reply))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No replies yet. Be the first to reply!
          </p>
        )}
      </div>
    </div>
  );
}
