export interface User {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  image?: string | null;
  phone?: string;
  partnerId?: number;

  companyName?: string;
  jobTitle?: string;

  isInstructor?: boolean;
  instructorId?: number;

  enrollmentsCount?: number;
  certificatesCount?: number;

  enrollments?: Enrollment[];
  certificates?: Certificate[];
  achievements?: Achievement[];

  totalPoints?: number;
  level?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: number;
  courseId: number;
  courseName: string;
  courseSlug: string;
  courseImage: string;
  userId: number;

  state: EnrollmentState;
  progress: number;

  enrollmentDate: string;
  expirationDate?: string;
  completionDate?: string;

  lastAccessDate?: string;
  totalTimeSpent: number;

  certificateId?: number;
  certificateUrl?: string;
}

export type EnrollmentState =
  | 'draft'
  | 'pending'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface Certificate {
  id: number;
  reference: string;
  courseName: string;
  courseSlug: string;
  issuedDate: string;
  expiryDate?: string;
  downloadUrl: string;
  verificationUrl: string;
  qrCode: string;
  templateName: string;
}

export interface Achievement {
  id: number;
  badgeId: number;
  badgeName: string;
  badgeIcon: string;
  badgeColor: string;
  description: string;
  earnedDate: string;
  points: number;
  isNew: boolean;
}

export interface UserStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalCertificates: number;
  totalPoints: number;
  totalBadges: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  points: number;
  badges: number;
  level: string;
}
