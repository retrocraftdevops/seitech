import { getOdooClient, type Domain } from './odoo-client';
import type { Course, CourseCategory, CourseFilters, CourseListResponse } from '@/types';

interface OdooCourse {
  id: number;
  name: string;
  website_url: string;
  description: string;
  description_short: string;
  image_1920: string;
  total_time: number;
  difficulty_level: string;
  delivery_method: string;
  list_price: number;
  rating_avg: number;
  rating_count: number;
  total_slides: number;
  nbr_enroll: number;
  category_id: [number, string] | false;
  user_id: [number, string] | false;
  website_meta_title: string;
  website_meta_description: string;
  is_published: boolean;
  sequence: number;
  create_date: string;
}

function transformCourse(odooCourse: OdooCourse): Course {
  return {
    id: odooCourse.id,
    name: odooCourse.name,
    slug: odooCourse.website_url?.replace('/slides/', '') || `course-${odooCourse.id}`,
    description: odooCourse.description || '',
    shortDescription: odooCourse.description_short || '',
    imageUrl: odooCourse.image_1920
      ? `${process.env.NEXT_PUBLIC_ODOO_URL}/web/image/slide.channel/${odooCourse.id}/image_1920`
      : '/images/course-placeholder.jpg',
    thumbnailUrl: odooCourse.image_1920
      ? `${process.env.NEXT_PUBLIC_ODOO_URL}/web/image/slide.channel/${odooCourse.id}/image_512`
      : '/images/course-placeholder.jpg',
    listPrice: odooCourse.list_price || 0,
    currency: 'GBP',
    categoryId: odooCourse.category_id ? odooCourse.category_id[0] : 0,
    categoryName: odooCourse.category_id ? odooCourse.category_id[1] : 'Uncategorized',
    deliveryMethod: (odooCourse.delivery_method as Course['deliveryMethod']) || 'e-learning',
    difficultyLevel: (odooCourse.difficulty_level as Course['difficultyLevel']) || 'beginner',
    duration: odooCourse.total_time || 0,
    totalSlides: odooCourse.total_slides || 0,
    totalQuizzes: 0,
    ratingAvg: odooCourse.rating_avg || 0,
    ratingCount: odooCourse.rating_count || 0,
    enrollmentCount: odooCourse.nbr_enroll || 0,
    instructorId: odooCourse.user_id ? odooCourse.user_id[0] : 0,
    instructorName: odooCourse.user_id ? odooCourse.user_id[1] : 'SEI Tech',
    instructorAvatar: '/images/avatar-placeholder.png',
    curriculum: [],
    outcomes: [],
    requirements: [],
    faqs: [],
    metaTitle: odooCourse.website_meta_title || odooCourse.name,
    metaDescription: odooCourse.website_meta_description || odooCourse.description_short || '',
    keywords: [],
    isPublished: odooCourse.is_published,
    isFeatured: false,
    createdAt: odooCourse.create_date,
    updatedAt: odooCourse.create_date,
  };
}

export async function getCourses(filters: CourseFilters = {}): Promise<CourseListResponse> {
  const odoo = getOdooClient();

  // Build domain filters
  const domain: Domain[] = [['is_published', '=', true]];

  if (filters.category) {
    domain.push(['category_id', '=', parseInt(filters.category)]);
  }

  if (filters.level) {
    domain.push(['difficulty_level', '=', filters.level]);
  }

  if (filters.delivery) {
    domain.push(['delivery_method', '=', filters.delivery]);
  }

  if (filters.search) {
    domain.push(['name', 'ilike', filters.search]);
  }

  if (filters.priceMin !== undefined) {
    domain.push(['list_price', '>=', filters.priceMin]);
  }

  if (filters.priceMax !== undefined) {
    domain.push(['list_price', '<=', filters.priceMax]);
  }

  if (filters.rating) {
    domain.push(['rating_avg', '>=', filters.rating]);
  }

  const page = 1;
  const limit = 12;

  const [odooCourses, total, categories] = await Promise.all([
    odoo.searchRead<OdooCourse>(
      'slide.channel',
      domain,
      [
        'id',
        'name',
        'website_url',
        'description',
        'description_short',
        'image_1920',
        'total_time',
        'difficulty_level',
        'delivery_method',
        'list_price',
        'rating_avg',
        'rating_count',
        'total_slides',
        'nbr_enroll',
        'category_id',
        'user_id',
        'website_meta_title',
        'website_meta_description',
        'is_published',
        'sequence',
        'create_date',
      ],
      {
        offset: (page - 1) * limit,
        limit,
        order: 'sequence asc, id desc',
      }
    ),
    odoo.searchCount('slide.channel', domain),
    getCategories(),
  ]);

  const courses = odooCourses.map(transformCourse);

  return {
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    categories,
    filters: {
      levels: ['beginner', 'intermediate', 'advanced'],
      deliveryMethods: ['e-learning', 'face-to-face', 'virtual', 'in-house'],
      accreditations: ['IOSH', 'Qualsafe', 'NEBOSH', 'ProQual', 'CPD'],
      priceRange: { min: 0, max: 500 },
    },
  };
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const odoo = getOdooClient();

  const courses = await odoo.searchRead<OdooCourse>(
    'slide.channel',
    [
      ['website_url', '=', `/slides/${slug}`],
      ['is_published', '=', true],
    ],
    [
      'id',
      'name',
      'website_url',
      'description',
      'description_short',
      'image_1920',
      'total_time',
      'difficulty_level',
      'delivery_method',
      'list_price',
      'rating_avg',
      'rating_count',
      'total_slides',
      'nbr_enroll',
      'category_id',
      'user_id',
      'website_meta_title',
      'website_meta_description',
      'is_published',
      'sequence',
      'create_date',
    ],
    { limit: 1 }
  );

  if (courses.length === 0) {
    return null;
  }

  return transformCourse(courses[0]);
}

export async function getCourseById(id: number): Promise<Course | null> {
  const odoo = getOdooClient();

  const courses = await odoo.read<OdooCourse>('slide.channel', id > 0 ? [id] : [], [
    'id',
    'name',
    'website_url',
    'description',
    'description_short',
    'image_1920',
    'total_time',
    'difficulty_level',
    'delivery_method',
    'list_price',
    'rating_avg',
    'rating_count',
    'total_slides',
    'nbr_enroll',
    'category_id',
    'user_id',
    'website_meta_title',
    'website_meta_description',
    'is_published',
    'sequence',
    'create_date',
  ]);

  if (courses.length === 0) {
    return null;
  }

  return transformCourse(courses[0]);
}

export async function getCategories(): Promise<CourseCategory[]> {
  const odoo = getOdooClient();

  interface OdooCategory {
    id: number;
    name: string;
    parent_id: [number, string] | false;
  }

  const categories = await odoo.searchRead<OdooCategory>(
    'course.category',
    [],
    ['id', 'name', 'parent_id'],
    { order: 'sequence asc, name asc' }
  );

  return categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
    courseCount: 0,
    parentId: cat.parent_id ? cat.parent_id[0] : undefined,
  }));
}

export async function getFeaturedCourses(limit: number = 6): Promise<Course[]> {
  const odoo = getOdooClient();

  const courses = await odoo.searchRead<OdooCourse>(
    'slide.channel',
    [
      ['is_published', '=', true],
      ['is_featured', '=', true],
    ],
    [
      'id',
      'name',
      'website_url',
      'description_short',
      'image_1920',
      'total_time',
      'difficulty_level',
      'delivery_method',
      'list_price',
      'rating_avg',
      'rating_count',
      'nbr_enroll',
      'category_id',
      'user_id',
    ],
    { limit, order: 'sequence asc' }
  );

  return courses.map(transformCourse);
}

export async function getPopularCourses(limit: number = 6): Promise<Course[]> {
  const odoo = getOdooClient();

  const courses = await odoo.searchRead<OdooCourse>(
    'slide.channel',
    [['is_published', '=', true]],
    [
      'id',
      'name',
      'website_url',
      'description_short',
      'image_1920',
      'total_time',
      'difficulty_level',
      'delivery_method',
      'list_price',
      'rating_avg',
      'rating_count',
      'nbr_enroll',
      'category_id',
      'user_id',
    ],
    { limit, order: 'nbr_enroll desc, rating_avg desc' }
  );

  return courses.map(transformCourse);
}

export async function getAllCourseSlugs(): Promise<{ slug: string }[]> {
  const odoo = getOdooClient();

  const courses = await odoo.searchRead<{ website_url: string }>(
    'slide.channel',
    [['is_published', '=', true]],
    ['website_url'],
    { order: 'id asc' }
  );

  return courses.map((course) => ({
    slug: course.website_url?.replace('/slides/', '') || '',
  }));
}
