import { redirect } from 'next/navigation';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryName = params.slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return {
    title: `${categoryName} Courses`,
    description: `Browse our ${categoryName.toLowerCase()} training courses`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  // Redirect /categories/[slug] to /courses?category=[slug]
  redirect(`/courses?category=${params.slug}`);
}
