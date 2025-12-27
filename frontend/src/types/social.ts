/**
 * Social Learning Type Definitions
 * Types for discussions, study groups, streaks, and leaderboards
 */

export type DiscussionCategory = 'question' | 'discussion' | 'announcement' | 'resource' | 'feedback';
export type DiscussionState = 'draft' | 'published' | 'resolved' | 'closed' | 'flagged';
export type ReplyState = 'published' | 'edited' | 'deleted' | 'flagged';
export type StudyGroupType = 'course' | 'skill' | 'project' | 'general';
export type StudyGroupPrivacy = 'public' | 'private' | 'secret';
export type StudyGroupJoinPolicy = 'open' | 'approval' | 'invitation';
export type StudyGroupState = 'draft' | 'active' | 'archived';
export type MemberRole = 'member' | 'moderator' | 'admin';
export type MemberState = 'invited' | 'pending' | 'active' | 'inactive' | 'banned';
export type LeaderboardCategory = 'overall' | 'points' | 'courses' | 'skills' | 'streak' | 'discussions' | 'certifications' | 'study_groups' | 'quiz_scores' | 'certificates';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';

export interface DiscussionTag {
  id: number;
  name: string;
  color: number;
}

export interface Discussion {
  id: number;
  name: string;
  content: string;
  author_id: number;
  author_name: string;
  author_avatar: string;
  category: DiscussionCategory;
  state: DiscussionState;
  course_id?: number;
  course_name?: string;
  slide_id?: number;
  slide_name?: string;
  study_group_id?: number;
  study_group_name?: string;
  tag_ids: number[];
  tags?: DiscussionTag[];
  skill_ids: number[];
  reply_count: number;
  upvote_count: number;
  view_count: number;
  has_best_answer: boolean;
  best_answer_id?: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_featured: boolean;
  upvote_ids: number[];
  has_upvoted?: boolean;
  published_date?: string;
  last_activity_date: string;
  resolved_date?: string;
  create_date: string;
  write_date: string;
}

export interface DiscussionReply {
  id: number;
  discussion_id: number;
  discussion_title: string;
  parent_id?: number;
  child_ids: number[];
  content: string;
  author_id: number;
  author_name: string;
  author_avatar: string;
  state: ReplyState;
  thread_level: number;
  upvote_count: number;
  upvote_ids: number[];
  has_upvoted?: boolean;
  is_best_answer: boolean;
  is_by_instructor: boolean;
  is_by_author: boolean;
  edited_date?: string;
  create_date: string;
  write_date: string;
  replies?: DiscussionReply[];
}

export interface StudySession {
  id: number;
  name: string;
  group_id: number;
  scheduled_date: string;
  duration: number;
  meeting_url?: string;
  description?: string;
  attendee_ids: number[];
  attendee_count: number;
  state: string;
}

export interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  owner_id: number;
  owner_name: string;
  group_type: StudyGroupType;
  privacy: StudyGroupPrivacy;
  join_policy: StudyGroupJoinPolicy;
  state: StudyGroupState;
  course_id?: number;
  course_name?: string;
  learning_path_id?: number;
  learning_path_name?: string;
  skill_ids: number[];
  max_members: number;
  member_count: number;
  member_ids: number[];
  discussion_count: number;
  schedule_ids: number[];
  next_session_id?: number;
  next_session?: StudySession;
  progress_percentage: number;
  goal?: string;
  is_featured: boolean;
  image_128?: string;
  last_activity_date: string;
  create_date: string;
  write_date: string;
  is_member?: boolean;
  member_role?: MemberRole;
  member_state?: MemberState;
}

export interface StudyGroupMember {
  id: number;
  group_id: number;
  group_name: string;
  user_id: number;
  user_name: string;
  user_avatar: string;
  role: MemberRole;
  state: MemberState;
  contribution_score: number;
  discussion_count: number;
  reply_count: number;
  helpful_count: number;
  session_attendance: number;
  progress_percentage: number;
  is_owner: boolean;
  join_date: string;
  last_active_date?: string;
}

export interface StreakMilestone {
  id: number;
  streak_id: number;
  days: number;
  achieved: boolean;
  achieved_date?: string;
  badge_id?: number;
  badge_name?: string;
  freeze_days_earned: number;
}

export interface LearningStreak {
  id: number;
  user_id: number;
  user_name: string;
  current_streak: number;
  longest_streak: number;
  longest_streak_start?: string;
  longest_streak_end?: string;
  start_date: string;
  last_activity_date: string;
  freeze_days_available: number;
  freeze_days_used: number;
  freeze_days_total: number;
  perfect_weeks: number;
  perfect_months: number;
  total_activities: number;
  next_milestone: number;
  daily_goal_met: boolean;
  milestone_ids: number[];
  milestones?: StreakMilestone[];
}

export interface LeaderboardEntry {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  rank: number;
  previous_rank: number;
  rank_change: number;
  score: number;
  previous_score: number;
  score_change: number;
  percentile: number;
  points_earned: number;
  courses_completed: number;
  skills_mastered: number;
  streak_days: number;
  discussions_contributed: number;
  discussions_count?: number;
  certifications_earned: number;
  achievements?: string[];
  level?: number;
  last_updated: string;
}

// Request/Response Types
export interface CreateDiscussionRequest {
  name: string;
  content: string;
  category: DiscussionCategory;
  course_id?: number;
  slide_id?: number;
  study_group_id?: number;
  tag_ids?: number[];
  skill_ids?: number[];
}

export interface UpdateDiscussionRequest {
  name?: string;
  content?: string;
  category?: DiscussionCategory;
  tag_ids?: number[];
  skill_ids?: number[];
  is_pinned?: boolean;
  is_locked?: boolean;
  is_featured?: boolean;
  state?: DiscussionState;
}

export interface CreateReplyRequest {
  discussion_id: number;
  content: string;
  parent_id?: number;
}

export interface UpdateReplyRequest {
  content?: string;
  state?: ReplyState;
}

export interface CreateStudyGroupRequest {
  name: string;
  description?: string;
  group_type: StudyGroupType;
  privacy: StudyGroupPrivacy;
  join_policy: StudyGroupJoinPolicy;
  course_id?: number;
  learning_path_id?: number;
  skill_ids?: number[];
  max_members?: number;
  goal?: string;
}

export interface UpdateStudyGroupRequest {
  name?: string;
  description?: string;
  privacy?: StudyGroupPrivacy;
  join_policy?: StudyGroupJoinPolicy;
  max_members?: number;
  goal?: string;
  state?: StudyGroupState;
}

export interface InviteUsersRequest {
  user_ids: number[];
}

export interface UpdateMemberRequest {
  role?: MemberRole;
  state?: MemberState;
}

export interface RecordActivityRequest {
  activity_type: string;
  points?: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Filter/Query Types
export interface DiscussionFilters {
  category?: DiscussionCategory;
  state?: DiscussionState;
  course_id?: number;
  study_group_id?: number;
  author_id?: number;
  tag_ids?: number[];
  has_best_answer?: boolean;
  is_pinned?: boolean;
  is_featured?: boolean;
  search?: string;
}

export interface StudyGroupFilters {
  group_type?: StudyGroupType;
  privacy?: StudyGroupPrivacy;
  state?: StudyGroupState;
  course_id?: number;
  skill_ids?: number[];
  is_featured?: boolean;
  search?: string;
}

export interface LeaderboardFilters {
  category?: LeaderboardCategory;
  period?: LeaderboardPeriod;
  user_id?: number;
  top_n?: number;
}
