# Adaptive Learning & Personalization Module

## Overview
Enterprise-grade adaptive learning system that personalizes learning paths based on user behavior, skills, goals, and performance. Uses collaborative filtering and skill-gap analysis to optimize learning outcomes.

## Business Requirements

### BR-01: Personalized Learning Paths
- Users can define learning goals (certifications, skills, career advancement)
- System generates optimal course sequences based on current skill level
- Paths adapt dynamically as user progresses
- Support for multiple concurrent learning paths

### BR-02: AI-Powered Recommendations
- Real-time course recommendations based on:
  - Completion history
  - Skill gaps
  - Similar user patterns (collaborative filtering)
  - Career path alignment
  - Trending courses in user's field
- Minimum 5 recommendation algorithms active

### BR-03: Skill Framework
- Hierarchical skill taxonomy (parent-child relationships)
- Course-to-skill mapping with proficiency levels
- User skill profiles with verification status
- Skill progression tracking over time

## Technical Specifications

### Database Models

#### 1. Learning Path (`seitech.learning.path`)
```python
Fields:
- name: Char (required) - Path title
- user_id: Many2one('res.users', required) - Path owner
- path_type: Selection - auto/manual/career/certification
- description: Html - Path description
- goal_description: Text - User's stated learning goal
- target_completion_date: Date
- weekly_commitment_hours: Integer (default: 5)
- learning_style: Selection - visual/reading/kinesthetic/auditory
- difficulty_preference: Selection - beginner/intermediate/advanced
- state: Selection - draft/active/completed/archived
- progress_percentage: Float (computed)
- estimated_hours_total: Float (computed)
- estimated_completion_date: Date (computed)

Relations:
- node_ids: One2many('seitech.learning.path.node')
- skill_goal_ids: Many2many('seitech.skill')
- prerequisite_path_ids: Many2many('seitech.learning.path')

Methods:
- generate_ai_path() - Generate path using AI algorithms
- recalculate_path() - Adjust path based on progress
- get_next_action() - Return next recommended action
- clone_path() - Create template from existing path
```

#### 2. Learning Path Node (`seitech.learning.path.node`)
```python
Fields:
- path_id: Many2one('seitech.learning.path', required)
- channel_id: Many2one('slide.channel', required)
- sequence: Integer
- node_type: Selection - required/optional/assessment
- is_completed: Boolean
- completion_date: Datetime
- unlock_date: Date (computed)
- prerequisite_node_ids: Many2many('seitech.learning.path.node')

Methods:
- check_prerequisites() - Verify if unlocked
- auto_enroll() - Enroll user when unlocked
```

#### 3. Skill (`seitech.skill`)
```python
Fields:
- name: Char (required)
- code: Char (unique) - e.g., "HEALTH_SAFETY_001"
- description: Text
- category: Selection - technical/soft/compliance/leadership/management
- parent_id: Many2one('seitech.skill')
- child_ids: One2many('seitech.skill')
- level_count: Integer (default: 5) - Number of proficiency levels
- icon: Char - Font Awesome icon class
- color: Char
- is_active: Boolean (default: True)
- industry_ids: Many2many('res.partner.industry')

Relations:
- course_skill_ids: One2many('seitech.course.skill')
- user_skill_ids: One2many('seitech.user.skill')

Computed:
- total_courses: Integer - Courses teaching this skill
- total_learners: Integer - Users with this skill
```

#### 4. Course Skill Mapping (`seitech.course.skill`)
```python
Fields:
- channel_id: Many2one('slide.channel', required)
- skill_id: Many2one('seitech.skill', required)
- proficiency_level: Selection - awareness/foundational/intermediate/advanced/expert
- skill_points: Integer (default: 10) - Points awarded on completion
- is_primary: Boolean - Is this a primary skill for the course?
- assessment_required: Boolean - Requires assessment to verify

Constraints:
- unique(channel_id, skill_id)
```

#### 5. User Skill Profile (`seitech.user.skill`)
```python
Fields:
- user_id: Many2one('res.users', required)
- skill_id: Many2one('seitech.skill', required)
- current_level: Selection - awareness/foundational/intermediate/advanced/expert
- points: Integer (default: 0)
- verified: Boolean (default: False) - Verified via assessment
- verification_date: Datetime
- last_updated: Datetime
- acquired_through_ids: Many2many('slide.channel') - Courses that contributed

Methods:
- update_from_course_completion(channel_id) - Award skill points
- verify_skill(assessment_score) - Verify via assessment
- get_skill_gap(target_level) - Calculate gap to target level

Constraints:
- unique(user_id, skill_id)
```

#### 6. Course Recommendation (`seitech.course.recommendation`)
```python
Fields:
- user_id: Many2one('res.users', required)
- channel_id: Many2one('slide.channel', required)
- recommendation_type: Selection - similar_courses/skill_gap/career_path/popular/trending/instructor_follow/completion_based
- score: Float (0.0-1.0) - Relevance score
- reason: Char - Human-readable reason
- context_data: Text - JSON metadata
- created_date: Datetime
- expires_date: Datetime
- is_dismissed: Boolean
- is_converted: Boolean - User enrolled

Methods:
- generate_recommendations(user_id, limit=10) - Static method
- dismiss() - User dismissed recommendation
- convert() - User enrolled
```

### API Endpoints

#### Learning Paths
```
POST   /api/learning-paths                  - Create new learning path
GET    /api/learning-paths                  - List user's learning paths
GET    /api/learning-paths/:id              - Get path details
PUT    /api/learning-paths/:id              - Update path
DELETE /api/learning-paths/:id              - Archive path
POST   /api/learning-paths/:id/generate-ai  - Generate AI path
POST   /api/learning-paths/:id/recalculate  - Recalculate progression
GET    /api/learning-paths/:id/next-action  - Get next recommended action
```

#### Skills
```
GET    /api/skills                          - List all skills (hierarchy)
GET    /api/skills/:id                      - Get skill details
GET    /api/skills/user-profile             - Get current user's skill profile
GET    /api/skills/gap-analysis             - Analyze skill gaps vs goals
POST   /api/skills/verify                   - Verify skill via assessment
GET    /api/skills/trending                 - Trending skills
```

#### Recommendations
```
GET    /api/recommendations                 - Get personalized recommendations
POST   /api/recommendations/:id/dismiss     - Dismiss recommendation
GET    /api/recommendations/refresh         - Force refresh recommendations
```

### Frontend Components

#### Learning Path Visualization
```tsx
<LearningPathVisualization
  pathId={number}
  interactive={boolean}
  onNodeClick={(node) => void}
  onPathUpdate={(path) => void}
/>
```

Features:
- Interactive roadmap with drag-drop reordering
- Visual node states (locked, current, completed)
- Progress indicators
- Prerequisite connections
- Time estimates
- Responsive design

#### Skill Gap Analysis
```tsx
<SkillGapAnalysis
  userId={number}
  targetSkills={Skill[]}
  onRecommendation={(courses) => void}
/>
```

Features:
- Radar chart of current vs target skills
- Gap indicators with severity
- Recommended courses to close gaps
- Estimated time to target

#### Personalized Recommendations
```tsx
<PersonalizedRecommendations
  userId={number}
  context="dashboard" | "course-detail" | "search"
  limit={number}
/>
```

Features:
- Multiple recommendation sections
- "Because you completed X" reasoning
- Match score indicators
- Dismiss functionality
- A/B testing support

### AI Algorithms

#### 1. Collaborative Filtering
```python
def collaborative_filtering(user_id):
    """Find similar users and recommend their courses."""
    # Get user's course history
    user_courses = get_user_courses(user_id)
    
    # Find similar users (cosine similarity)
    similar_users = find_similar_users(user_id, min_similarity=0.7)
    
    # Get courses they took that user hasn't
    recommendations = []
    for similar_user in similar_users:
        their_courses = get_user_courses(similar_user)
        new_courses = their_courses - user_courses
        for course in new_courses:
            recommendations.append({
                'channel_id': course.id,
                'score': similar_user.similarity * course.rating,
                'reason': f'Students like you also took this course'
            })
    
    return sorted(recommendations, key=lambda x: x['score'], reverse=True)
```

#### 2. Skill-Gap Analysis
```python
def skill_gap_recommendations(user_id):
    """Recommend courses to fill skill gaps."""
    # Get user's skill profile
    user_skills = env['seitech.user.skill'].search([('user_id', '=', user_id)])
    
    # Get target skills from learning goals
    target_skills = get_target_skills(user_id)
    
    # Calculate gaps
    gaps = []
    for target in target_skills:
        current = next((s for s in user_skills if s.skill_id == target.skill_id), None)
        if not current or current.current_level < target.target_level:
            gaps.append({
                'skill': target.skill_id,
                'gap_size': calculate_gap_size(current, target),
                'priority': target.priority
            })
    
    # Find courses that teach gap skills
    recommendations = []
    for gap in gaps:
        courses = env['seitech.course.skill'].search([
            ('skill_id', '=', gap['skill'].id),
            ('proficiency_level', '=', get_next_level(current))
        ])
        for course_skill in courses:
            recommendations.append({
                'channel_id': course_skill.channel_id.id,
                'score': gap['priority'] * 0.8,
                'reason': f'Teaches {gap["skill"].name} ({gap["gap_size"]} point gap)'
            })
    
    return recommendations
```

#### 3. Content-Based Filtering
```python
def content_based_recommendations(user_id):
    """Recommend similar courses based on content."""
    # Get recently completed courses
    recent_courses = get_recent_completions(user_id, limit=5)
    
    recommendations = []
    for course in recent_courses:
        # Find similar courses by category, difficulty, skills
        similar = env['slide.channel'].search([
            ('seitech_category_id', '=', course.seitech_category_id.id),
            ('difficulty_level', 'in', [course.difficulty_level, get_next_difficulty(course)]),
            ('id', 'not in', get_user_courses(user_id))
        ])
        
        for sim_course in similar:
            # Calculate similarity score
            skill_overlap = calculate_skill_overlap(course, sim_course)
            recommendations.append({
                'channel_id': sim_course.id,
                'score': skill_overlap * sim_course.rating / 5.0,
                'reason': f'Similar to {course.name}'
            })
    
    return recommendations
```

### Performance Optimization

#### Caching Strategy
- Cache user skill profiles (1 hour TTL)
- Cache recommendations (30 minutes TTL)
- Cache skill hierarchy (24 hours TTL)
- Invalidate on relevant updates

#### Indexing
```sql
-- Critical indexes for performance
CREATE INDEX idx_learning_path_user ON seitech_learning_path(user_id, state);
CREATE INDEX idx_user_skill_user ON seitech_user_skill(user_id);
CREATE INDEX idx_course_skill_channel ON seitech_course_skill(channel_id);
CREATE INDEX idx_course_skill_skill ON seitech_course_skill(skill_id);
CREATE INDEX idx_recommendation_user ON seitech_course_recommendation(user_id, expires_date);
```

#### Background Jobs
- Generate recommendations: Hourly for active users
- Recalculate learning paths: Daily
- Update skill trends: Weekly
- Cleanup expired recommendations: Daily

## Testing Requirements

### Unit Tests
- Learning path generation with various user profiles
- Skill level progression calculation
- Recommendation algorithm accuracy
- Path adaptation on course completion

### Integration Tests
- End-to-end learning path creation and completion
- Skill verification flow
- Recommendation conversion tracking
- Multi-path management

### Performance Tests
- Recommendation generation < 200ms for 1000 courses
- Path calculation < 500ms for 50 nodes
- Skill hierarchy query < 100ms
- Handle 10,000 concurrent users

## Success Metrics
- 50%+ users create learning paths within 7 days
- 30%+ conversion rate on recommendations
- 25%+ improvement in course completion rates
- 60%+ users update skill profiles
- <300ms average recommendation response time

## Dependencies
- Odoo 19.0 Enterprise
- Python 3.12+
- NumPy, SciPy for algorithms
- Redis for caching
- Celery for background jobs

## Migration Plan
- Add models incrementally (skills → paths → recommendations)
- Backfill skills for existing courses (manual + AI)
- Generate initial user skill profiles from enrollment history
- Run recommendation engine on all active users
- Monitor and tune algorithm weights
