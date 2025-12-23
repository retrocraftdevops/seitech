export { getOdooClient, createOdooClient, OdooClient } from './odoo-client';
export type { OdooConfig, OdooSession, Domain, SearchOptions } from './odoo-client';

export {
  getCourses,
  getCourseBySlug,
  getCourseById,
  getCategories,
  getFeaturedCourses,
  getPopularCourses,
  getAllCourseSlugs,
} from './courses';

// CMS API Functions
export {
  getSiteSettings,
  getNavigation,
  getPages,
  getPage,
  getSection,
  getTestimonials,
  getFaqs,
  getFaqCategories,
  getTeam,
  getPartners,
  getHomepageData,
} from './cms';
