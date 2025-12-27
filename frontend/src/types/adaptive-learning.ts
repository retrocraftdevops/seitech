/**
 * TypeScript types for Adaptive Learning API
 */

// ============================================================================
// LEARNING PATHS
// ============================================================================

export type PathType = 'custom' | 'adaptive' | 'structured';
export type PathState = 'draft' | 'active' | 'completed' | 'cancelled';

export interface LearningPath {
  id: number;
  name: string;
  user_id: [number, string];
  path_type: PathType;
  state: PathState;
  goal: string;
  progress_percentage: number;
  node_count: number;
  completed_count: number;
  estimated_hours: number;
  deadline: string | null;
  start_date: string | null;
  completion_date: string | null;
  last_activity: string;
  skill_ids: number[];
  node_ids?: number[];
  nodes?: LearningPathNode[];
  skills?: Skill[];
  is_template: boolean;
  template_id: [number, string] | null;
}

export interface CreateLearningPathRequest {
  name: string;
  goal?: string;
  pathType?: PathType;
  skillIds?: number[];
  templateId?: number;
  deadline?: string;
}

export interface UpdateLearningPathRequest {
  name?: string;
  goal?: string;
  deadline?: string;
  skillIds?: number[];
}

export type NodeState = 'locked' | 'available' | 'active' | 'completed' | 'skipped';

export interface LearningPathNode {
  id: number;
  path_id: [number, string];
  channel_id: [number, string];
  sequence: number;
  is_required: boolean;
  state: NodeState;
  progress_percentage: number;
  deadline: string | null;
  completion_date: string | null;
  enrollment_id: [number, string] | null;
  prerequisite_ids: number[];
}

export interface PathActionRequest {
  action: 'activate' | 'complete' | 'cancel' | 'reset' | 'generate_ai' | 'recalculate' | 'next_action' | 'add_course' | 'remove_course';
  params?: {
    algorithm?: 'collaborative' | 'content' | 'skill_gap' | 'hybrid';
    maxCourses?: number;
    courseId?: number;
    nodeId?: number;
    isRequired?: boolean;
    sequence?: number;
  };
}

// ============================================================================
// SKILLS
// ============================================================================

export type SkillCategory = 'technical' | 'soft' | 'business' | 'language' | 'other';
export type ProficiencyLevel = 'awareness' | 'foundational' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  description: string;
  parent_id: [number, string] | null;
  child_ids: number[];
  children?: Skill[];
  total_courses: number;
  total_learners: number;
  average_proficiency: number;
  is_trending: boolean;
  trending_score: number;
  industry: string;
  course_skill_ids?: number[];
  courses?: CourseWithSkillMapping[];
}

export interface CourseWithSkillMapping {
  id: number;
  name: string;
  description: string;
  total_slides: number;
  total_time: number;
  rating_avg: number;
  proficiency_level: ProficiencyLevel;
  is_primary: boolean;
  skill_points: number;
}

export interface CourseInfo {
  id: number;
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  total_slides?: number;
  total_time?: number;
  rating_avg?: number;
}

export interface UserSkill {
  id: number;
  user_id: [number, string];
  skill_id: [number, string];
  skill_name: string;
  skill_category: SkillCategory;
  current_level: ProficiencyLevel;
  target_level: ProficiencyLevel | null;
  points: number;
  progress_percentage: number;
  verified: boolean;
  verified_date: string | null;
  verification_score: number | null;
  acquired_count: number;
  first_acquired: string;
  last_updated: string;
  last_practiced: string | null;
  badge_id: [number, string] | null;
}

export interface UserSkillProfile {
  skills: UserSkill[];
  profile: {
    total_skills: number;
    verified_skills: number;
    expert_skills: number;
    advanced_skills: number;
    total_points: number;
    categories: {
      [key: string]: {
        count: number;
        verified: number;
        points: number;
      };
    };
  };
}

export interface UserSkillActionRequest {
  action: 'set_target' | 'practiced' | 'level_up';
  skillId: number;
  targetLevel?: ProficiencyLevel;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export type RecommendationAlgorithm = 'collaborative' | 'content' | 'skill_gap' | 'trending' | 'instructor' | 'hybrid';
export type RecommendationReason = 'similar_users' | 'course_similarity' | 'skill_requirement' | 'trending' | 'instructor_match' | 'path_requirement' | 'category_interest';
export type RecommendationStatus = 'pending' | 'viewed' | 'enrolled' | 'dismissed' | 'saved';

export interface Recommendation {
  id: number;
  user_id: [number, string];
  course_id: [number, string];
  course_name: string;
  course_category_id: [number, string] | null;
  score: number;
  algorithm: RecommendationAlgorithm;
  reason_type: RecommendationReason;
  reason_text: string;
  status: RecommendationStatus;
  created_date: string;
  expires_date: string;
  viewed_date: string | null;
  is_expired: boolean;
  course?: {
    id: number;
    name: string;
    description: string;
    image_1024: string;
    total_slides: number;
    total_time: number;
    rating_avg: number;
  };
}

export interface GenerateRecommendationsRequest {
  algorithm?: RecommendationAlgorithm;
  limit?: number;
}

export interface RecommendationActionRequest {
  action: 'viewed' | 'enroll' | 'save' | 'dismiss';
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// ============================================================================
// API QUERY PARAMETERS
// ============================================================================

export interface LearningPathsQuery {
  state?: PathState;
  type?: PathType;
  templates?: boolean;
  limit?: number;
  offset?: number;
}

export interface SkillsQuery {
  category?: SkillCategory;
  trending?: boolean;
  parentId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UserSkillsQuery {
  category?: SkillCategory;
  verified?: boolean;
  level?: ProficiencyLevel;
}

export interface RecommendationsQuery {
  status?: RecommendationStatus;
  algorithm?: RecommendationAlgorithm;
  minScore?: number;
  limit?: number;
}
