# Social Learning & Engagement Module

## Overview
Enterprise discussion forums, study groups, enhanced gamification with streaks and competitive leaderboards to drive engagement and knowledge sharing.

## Business Requirements

### BR-01: Discussion Forums
- Course-specific and lesson-specific discussion threads
- Upvoting, best answer marking, moderation
- Rich text editor with code syntax highlighting
- @mention notifications
- Thread pinning and categories
- Integration with gamification (points for helpful answers)

### BR-02: Study Groups
- User-created or instructor-managed groups
- Group schedules and meeting coordination
- Shared resources and notes
- Group progress tracking
- Private and public groups

### BR-03: Enhanced Gamification
- Daily learning streaks with freeze mechanism
- Period-based leaderboards (daily, weekly, monthly, all-time)
- Category and course-specific leaderboards
- Streak milestones with special rewards
- XP levels with visual progression

## Technical Specifications

### Database Models

#### 1. Discussion Thread (`seitech.discussion`)
```python
Fields:
- name: Char (required) - Thread title
- channel_id: Many2one('slide.channel', required) - Parent course
- slide_id: Many2one('slide.slide') - Specific lesson (optional)
- author_id: Many2one('res.users', required)
- content: Html (required)
- category: Selection - general/question/announcement/bug_report
- state: Selection - draft/published/closed/archived
- is_pinned: Boolean
- is_answered: Boolean
- best_answer_id: Many2one('seitech.discussion.reply')

Engagement:
- reply_ids: One2many('seitech.discussion.reply')
- reply_count: Integer (computed)
- view_count: Integer
- upvote_count: Integer
- upvote_user_ids: Many2many('res.users', 'discussion_upvote_rel')
- follower_ids: Many2many('res.users', 'discussion_follow_rel')

Moderation:
- is_flagged: Boolean
- flag_reason: Text
- moderator_notes: Text
- edited_date: Datetime
- edit_history: Text (JSON)

SEO:
- slug: Char (unique per course)
- meta_description: Text

Methods:
- upvote(user_id) - Toggle upvote
- mark_best_answer(reply_id) - Set best answer
- notify_followers() - Send notifications
- flag_inappropriate() - Flag for moderation
```

#### 2. Discussion Reply (`seitech.discussion.reply`)
```python
Fields:
- thread_id: Many2one('seitech.discussion', required)
- parent_reply_id: Many2one('seitech.discussion.reply') - For nested replies
- author_id: Many2one('res.users', required)
- content: Html (required)
- is_solution: Boolean - Marked as best answer
- upvote_count: Integer
- upvote_user_ids: Many2many('res.users', 'reply_upvote_rel')
- is_flagged: Boolean
- created_date: Datetime
- edited_date: Datetime

Relations:
- child_reply_ids: One2many('seitech.discussion.reply', 'parent_reply_id')
- mention_ids: Many2many('res.users') - @mentioned users

Methods:
- upvote(user_id) - Toggle upvote
- send_mentions() - Notify @mentioned users
- award_points() - Award gamification points for helpful reply
```

#### 3. Study Group (`seitech.study.group`)
```python
Fields:
- name: Char (required)
- description: Html
- channel_id: Many2one('slide.channel') - Optional course focus
- owner_id: Many2one('res.users', required)
- co_admin_ids: Many2many('res.users', 'group_admin_rel')
- member_ids: Many2many('res.users', 'group_member_rel')
- invited_user_ids: Many2many('res.users', 'group_invite_rel')

Settings:
- is_public: Boolean (default: True)
- join_approval_required: Boolean (default: False)
- max_members: Integer (default: 50)
- meeting_day: Selection - monday/tuesday/.../sunday
- meeting_time: Float - Hour of day (0-24)
- timezone: Selection
- meeting_url: Char - Virtual meeting link

Progress:
- target_completion_date: Date
- group_goal: Text
- average_progress: Float (computed)

Stats:
- member_count: Integer (computed)
- session_count: Integer (computed)
- total_study_hours: Float (computed)

Methods:
- invite_member(user_id) - Send invitation
- approve_member(user_id) - Approve join request
- remove_member(user_id) - Remove member
- schedule_session(datetime, duration) - Create study session
```

#### 4. Study Session (`seitech.study.session`)
```python
Fields:
- group_id: Many2one('seitech.study.group', required)
- name: Char (required) - Session title
- scheduled_time: Datetime (required)
- duration_hours: Float (default: 2.0)
- meeting_url: Char
- agenda: Html
- notes: Html - Session notes/minutes
- recording_url: Char

Attendance:
- attendee_ids: Many2many('res.users', 'session_attendee_rel')
- rsvp_yes_ids: Many2many('res.users', 'session_rsvp_yes_rel')
- rsvp_no_ids: Many2many('res.users', 'session_rsvp_no_rel')
- actual_attendees: Integer (computed)

Resources:
- slide_ids: Many2many('slide.slide') - Covered lessons
- attachment_ids: Many2many('ir.attachment')

State:
- state: Selection - scheduled/in_progress/completed/cancelled

Methods:
- send_reminders() - Send 24h and 1h reminders
- mark_attendance(user_ids) - Record attendance
- award_participation_points() - Award points to attendees
```

#### 5. Learning Streak (`seitech.learning.streak`)
```python
Fields:
- user_id: Many2one('res.users', required, unique)
- current_streak: Integer (default: 0)
- longest_streak: Integer (default: 0)
- last_activity_date: Date
- streak_freeze_count: Integer (default: 0) - Available streak protections
- total_freeze_used: Integer (default: 0)
- streak_start_date: Date

Milestones:
- milestone_7_days: Boolean
- milestone_30_days: Boolean
- milestone_100_days: Boolean
- milestone_365_days: Boolean

Stats:
- total_active_days: Integer
- average_daily_minutes: Float
- preferred_study_time: Selection - morning/afternoon/evening/night

Methods:
- record_activity() - Update streak on learning activity
- use_freeze() - Use a streak freeze
- earn_freeze() - Earn freeze via achievement
- award_milestone(days) - Award milestone badge/points
- get_streak_status() - Return status and next milestone

Constraints:
- unique(user_id)
```

#### 6. Leaderboard (`seitech.leaderboard`)
```python
Fields:
- name: Char (computed) - Display name
- user_id: Many2one('res.users', required)
- period_type: Selection - daily/weekly/monthly/all_time
- period_start: Date (required)
- period_end: Date (required)
- points: Integer (default: 0)
- rank: Integer
- rank_change: Integer - Change from previous period

Scope:
- scope_type: Selection - global/category/course
- category_id: Many2one('seitech.course.category')
- channel_id: Many2one('slide.channel')

Stats:
- courses_completed: Integer
- lessons_completed: Integer
- quizzes_passed: Integer
- streak_days: Integer
- badges_earned: Integer
- contributions: Integer - Forum posts + replies

Cache:
- last_updated: Datetime
- is_cache_valid: Boolean

Methods:
- calculate_rank() - Recalculate rankings
- get_leaderboard(period, scope, limit) - Static method
- get_user_rank(user_id, period, scope) - Get specific user rank
- get_neighbors(user_id, radius=5) - Get users above/below

Indexes:
- (period_type, period_start, scope_type, rank)
- (user_id, period_type, scope_type)

Constraints:
- unique(user_id, period_type, period_start, scope_type, category_id, channel_id)
```

### API Endpoints

#### Discussions
```
GET    /api/discussions?channel_id=&category=        - List discussions
POST   /api/discussions                              - Create discussion
GET    /api/discussions/:id                          - Get discussion details
PUT    /api/discussions/:id                          - Update discussion
DELETE /api/discussions/:id                          - Delete discussion
POST   /api/discussions/:id/upvote                   - Toggle upvote
POST   /api/discussions/:id/reply                    - Post reply
PUT    /api/discussions/:id/best-answer/:reply_id    - Mark best answer
POST   /api/discussions/:id/flag                     - Flag discussion
GET    /api/discussions/:id/replies                  - Get replies (paginated)
```

#### Study Groups
```
GET    /api/study-groups                             - List public groups
POST   /api/study-groups                             - Create group
GET    /api/study-groups/:id                         - Get group details
PUT    /api/study-groups/:id                         - Update group
DELETE /api/study-groups/:id                         - Delete group
POST   /api/study-groups/:id/join                    - Join group
POST   /api/study-groups/:id/leave                   - Leave group
POST   /api/study-groups/:id/invite                  - Invite member
GET    /api/study-groups/:id/sessions                - List sessions
POST   /api/study-groups/:id/sessions                - Create session
```

#### Gamification
```
GET    /api/gamification/streak                      - Get user's streak
POST   /api/gamification/streak/freeze               - Use streak freeze
GET    /api/gamification/leaderboard?period=&scope=  - Get leaderboard
GET    /api/gamification/user-rank?period=&scope=    - Get user's rank
GET    /api/gamification/achievements                - List user achievements
```

### Frontend Components

#### Discussion List
```tsx
<DiscussionList
  channelId={number}
  category="all" | "question" | "announcement"
  sortBy="recent" | "popular" | "unanswered"
  onCreateThread={() => void}
/>
```

Features:
- Filter by category
- Sort options
- Search within discussions
- Pinned threads at top
- Answer status indicators
- View count and reply count
- Mobile-responsive

#### Discussion Thread View
```tsx
<DiscussionThread
  threadId={number}
  onReply={(content) => void}
  onUpvote={() => void}
  onMarkBestAnswer={(replyId) => void}
/>
```

Features:
- Rich text editor with mentions
- Nested replies (2 levels)
- Upvote animations
- Best answer highlighting
- Edit history
- Flag/report functionality
- Share thread

#### Study Group Card
```tsx
<StudyGroupCard
  group={StudyGroup}
  onJoin={() => void}
  onView={() => void}
/>
```

Features:
- Member count and avatars
- Next session info
- Progress indicator
- Join/leave button
- Public/private badge

#### Streak Display
```tsx
<StreakDisplay
  userId={number}
  showDetails={boolean}
  onFreeze={() => void}
/>
```

Features:
- Fire icon animation
- Current vs longest streak
- Days until next milestone
- Freeze button when available
- Calendar heatmap view
- Streak statistics

#### Leaderboard Table
```tsx
<LeaderboardTable
  period="daily" | "weekly" | "monthly" | "all_time"
  scope="global" | "category" | "course"
  scopeId={number}
  highlightUserId={number}
  limit={number}
/>
```

Features:
- Top 10/50/100 display
- Rank change indicators (↑↓)
- Avatar and profile links
- Points and stats
- Pagination
- Auto-refresh
- Current user highlight
- Podium display for top 3

### Real-time Features

#### WebSocket Events
```typescript
// Discussion updates
socket.on('discussion:new_reply', (data) => {
  // Update thread reply count
  // Show notification if user is thread author
});

socket.on('discussion:upvote', (data) => {
  // Update upvote count in real-time
});

// Leaderboard updates
socket.on('leaderboard:rank_change', (data) => {
  // Animate rank change
  // Show notification if significant change
});

// Streak updates
socket.on('streak:milestone', (data) => {
  // Show celebration animation
  // Award badge notification
});
```

### Gamification Rules

#### Point Awards
```python
POINT_AWARDS = {
    'discussion_create': 5,
    'discussion_reply': 3,
    'discussion_upvote_received': 1,
    'discussion_best_answer': 25,
    'study_session_attend': 10,
    'study_session_host': 15,
    'streak_7_days': 50,
    'streak_30_days': 200,
    'streak_100_days': 1000,
    'streak_365_days': 5000,
}
```

#### Streak Freeze Rules
- Start with 2 freeze tokens
- Earn 1 freeze per 30-day streak
- Maximum 5 freeze tokens
- Freeze protects 1 day of inactivity
- Must be activated before missing day

### Performance Optimization

#### Caching
- Discussion list: 5 minutes
- Leaderboard: 15 minutes
- User streak: 1 hour
- Study group list: 10 minutes

#### Database Optimization
```sql
-- Indexes for discussions
CREATE INDEX idx_discussion_channel ON seitech_discussion(channel_id, state);
CREATE INDEX idx_discussion_author ON seitech_discussion(author_id, created_date);
CREATE INDEX idx_reply_thread ON seitech_discussion_reply(thread_id, created_date);

-- Indexes for leaderboard
CREATE INDEX idx_leaderboard_period ON seitech_leaderboard(period_type, period_start, rank);
CREATE INDEX idx_leaderboard_user ON seitech_leaderboard(user_id, period_type);

-- Indexes for streak
CREATE INDEX idx_streak_user ON seitech_learning_streak(user_id);
CREATE INDEX idx_streak_current ON seitech_learning_streak(current_streak DESC);
```

#### Background Jobs
- Update leaderboards: Every 15 minutes
- Check streaks: Daily at midnight
- Send study session reminders: 24h and 1h before
- Archive old discussions: Monthly
- Calculate leaderboard ranks: Every hour

## Testing Requirements

### Unit Tests
- Discussion CRUD operations
- Upvote toggle logic
- Best answer marking
- Streak calculation
- Leaderboard ranking algorithm
- Point award calculations

### Integration Tests
- Complete discussion flow (create → reply → upvote → best answer)
- Study group lifecycle (create → invite → session → complete)
- Streak milestone achievement
- Leaderboard period transitions

### Load Tests
- 1000 concurrent discussion views
- 100 simultaneous upvotes
- Leaderboard query with 100k users
- Real-time updates to 5000 clients

## Success Metrics
- 40%+ users participate in discussions monthly
- 15%+ users join study groups
- 50%+ users maintain 7+ day streaks
- 70%+ engagement with leaderboards
- <200ms discussion load time
- <150ms leaderboard load time

## Dependencies
- Odoo 19.0 mail.thread
- Redis for caching and real-time
- Socket.io for WebSocket
- Sanitize library for HTML content
- Markdown parser

## Migration Plan
- Create discussion tables
- Migrate existing comments to discussions
- Initialize user streaks from activity history
- Generate initial leaderboards
- Create sample study groups
- Train users with tutorials
