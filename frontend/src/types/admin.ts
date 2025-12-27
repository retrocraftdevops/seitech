// Admin panel types
export type UserRole = 'student' | 'student_admin' | 'instructor' | 'manager' | 'admin';

export type Permission =
  // User permissions
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  // Instructor permissions
  | 'instructors.view'
  | 'instructors.create'
  | 'instructors.edit'
  | 'instructors.delete'
  // Course permissions
  | 'courses.view'
  | 'courses.create'
  | 'courses.edit'
  | 'courses.delete'
  | 'courses.publish'
  // Enrollment permissions
  | 'enrollments.view'
  | 'enrollments.create'
  | 'enrollments.edit'
  | 'enrollments.delete'
  // Certificate permissions
  | 'certificates.view'
  | 'certificates.issue'
  | 'certificates.revoke'
  // Analytics permissions
  | 'analytics.view'
  // Settings permissions
  | 'settings.view'
  | 'settings.edit';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  totalCertificates: number;
  totalRevenue: number;
}

export interface AdminActivity {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  action: string;
  resource: string;
  resourceId: number;
  description: string;
  timestamp: string;
}

export interface AdminAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  enrollments: {
    date: string;
    count: number;
  }[];
  completions: {
    date: string;
    count: number;
  }[];
  revenue: {
    date: string;
    amount: number;
  }[];
  topCourses: {
    id: number;
    name: string;
    enrollments: number;
    completions: number;
    revenue: number;
  }[];
}

export interface DashboardStats {
  stats: AdminStats;
  analytics: AdminAnalytics;
  recentActivities: AdminActivity[];
  trends: {
    usersGrowth: number;
    coursesGrowth: number;
    enrollmentsGrowth: number;
    revenueGrowth: number;
  };
}

export interface AdminInstructor {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar?: string;
  title?: string;
  bio?: string;
  specializations: string[];
  rating: number;
  totalStudents: number;
  totalCourses: number;
  totalEarnings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  students: number;
  rating: number;
  earnings: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalEarnings: number;
  averageRating: number;
  monthlyEarnings: {
    month: string;
    amount: number;
  }[];
  topCourses: InstructorCourse[];
}

export interface CreateInstructorData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  title?: string;
  bio?: string;
  specializations: string[];
  avatar?: File;
  linkExistingUser?: boolean;
  userId?: number;
}

export interface UpdateInstructorData {
  firstName?: string;
  lastName?: string;
  title?: string;
  bio?: string;
  specializations?: string[];
  avatar?: File;
  isActive?: boolean;
}

export interface AdminEnrollment {
  id: number;
  userId: number;
  courseId: number;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  courseName: string;
  courseSlug: string;
  courseThumbnail?: string;
  status: EnrollmentStatus;
  progress: number;
  enrolledDate: string;
  expiresDate?: string;
  completedDate?: string;
  lastAccessDate?: string;
  certificateId?: number;
  createdAt: string;
  updatedAt: string;
}

export type EnrollmentStatus = 'active' | 'completed' | 'expired' | 'cancelled';

export interface EnrollmentFilters {
  search?: string;
  status?: EnrollmentStatus | 'all';
  courseId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface BulkEnrollmentData {
  courseId: number;
  userIds?: number[];
  userEmails?: string[];
  sendNotification: boolean;
  expiresDate?: string;
}

export interface EnrollmentStatusUpdate {
  enrollmentId: number;
  status: EnrollmentStatus;
  reason?: string;
}

export interface BulkEnrollmentPreview {
  email: string;
  name?: string;
  status: 'valid' | 'invalid' | 'duplicate';
  message?: string;
}

// Certificate management types
export type CertificateStatus = 'valid' | 'expired' | 'revoked';

export interface AdminCertificate {
  id: number;
  certificateCode: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  courseId: number;
  courseName: string;
  courseSlug: string;
  enrollmentId: number;
  templateId?: number;
  templateName: string;
  status: CertificateStatus;
  issuedDate: string;
  expiryDate?: string;
  revokedDate?: string;
  revokedBy?: number;
  revokedReason?: string;
  downloadUrl: string;
  verificationUrl: string;
  qrCodeUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTemplate {
  id: number;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CertificateFilters {
  status?: CertificateStatus;
  courseId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface IssueCertificateData {
  enrollmentId?: number;
  userId?: number;
  courseId?: number;
  templateId?: number;
  customExpiryDate?: string;
}

export interface RevokeCertificateData {
  certificateId: number;
  reason: string;
}

export interface CompletedEnrollment {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  courseId: number;
  courseName: string;
  completionDate: string;
  hasCertificate: boolean;
}
