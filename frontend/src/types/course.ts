export interface Course {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;

  // Pricing
  listPrice: number;
  discountPrice?: number | null;
  currency: string;

  // Classification
  categoryId?: number | null;
  categoryName: string;
  deliveryMethod: string;
  difficultyLevel: string;
  accreditation?: string | null;

  // Metrics
  duration: number;
  totalSlides: number;
  totalQuizzes: number;
  ratingAvg: number;
  ratingCount: number;
  enrollmentCount: number;

  // Instructor
  instructorId?: number | null;
  instructorName: string;
  instructorAvatar?: string | null;
  instructorBio?: string;

  // Content
  curriculum: CourseCurriculum[];
  outcomes: string[];
  requirements: string[];
  targetAudience?: string;
  faqs: CourseFAQ[];

  // Meta
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  isPublished: boolean;
  isFeatured: boolean;
  isPaid?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type DeliveryMethod = 'e-learning' | 'face-to-face' | 'virtual' | 'in-house';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type Accreditation = 'IOSH' | 'Qualsafe' | 'NEBOSH' | 'ProQual' | 'CPD';

export interface CourseCurriculum {
  id: number;
  name: string;
  sequence: number;
  slides: CourseSlide[];
}

export interface CourseSlide {
  id: number;
  name: string;
  slideType: SlideType;
  duration: number;
  isPreview: boolean;
  completionTime: number;
}

export type SlideType = 'video' | 'document' | 'infographic' | 'quiz' | 'webpage';

export interface CourseFAQ {
  question: string;
  answer: string;
}

export interface CourseReview {
  id: number;
  rating: number;
  comment: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  helpful: number;
}

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  courseCount: number;
  parentId?: number;
  children?: CourseCategory[];
}

export interface CourseFilters {
  category?: string;
  level?: DifficultyLevel;
  delivery?: DeliveryMethod;
  accreditation?: Accreditation;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  search?: string;
}

export interface CoursePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourseListResponse {
  courses: Course[];
  pagination: CoursePagination;
  categories: CourseCategory[];
  filters: {
    levels: DifficultyLevel[];
    deliveryMethods: DeliveryMethod[];
    accreditations: Accreditation[];
    priceRange: { min: number; max: number };
  };
}
