import DiscussionThread from '@/components/social/DiscussionThread';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DiscussionPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <Link
          href="/forums"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forums
        </Link>
        <DiscussionThread discussionId={parseInt(params.id)} />
      </div>
    </div>
  );
}
