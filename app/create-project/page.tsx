'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CreateProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('16:9');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || creating) return;

    setCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: name.trim(),
          aspect_ratio: aspectRatio
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to the project editor/studio page
      router.push(`/project/${data.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create project');
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-2000 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white hover:text-white mb-6 transition-colors"
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

        {/* Create Project Form */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-black rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-white mb-6">
              Create New Project
            </h1>

            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Video"
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* 16:9 Landscape */}
                  <button
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all ${
                      aspectRatio === '16:9'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className={`mb-3 rounded ${
                        aspectRatio === '16:9' ? 'bg-blue-900' : 'bg-gray-400'
                      }`}
                      style={{ width: '64px', height: '36px' }}
                    />
                    <span className="font-semibold text-gray-400">16:9</span>
                    <span className="text-sm text-gray-400">Landscape</span>
                  </button>

                  {/* 9:16 Portrait */}
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg transition-all ${
                      aspectRatio === '9:16'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className={`mb-3 rounded ${
                        aspectRatio === '9:16' ? 'bg-blue-900' : 'bg-gray-400'
                      }`}
                      style={{ width: '36px', height: '64px' }}
                    />
                    <span className="font-semibold text-gray-400">9:16</span>
                    <span className="text-sm text-gray-400">Portrait</span>
                  </button>
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  !name.trim() || creating
                    ? 'bg-gray-300 text-gray-900 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}