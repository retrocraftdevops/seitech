import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Course Categories',
  description: 'Browse our training courses by category',
};

export default function CategoriesIndexPage() {
  // Redirect /categories to /courses (all categories)
  redirect('/courses');
}
