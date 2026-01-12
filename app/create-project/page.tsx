'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function CreateProjectPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
        
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back</span>
        </button>

        <div className="max-w-2xl mx-auto mt-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Project Page
          </h1>
          <p className="text-gray-600">
            This is where you'll create new video projects.
          </p>
        </div>
      </div>
    </div>
  );
}