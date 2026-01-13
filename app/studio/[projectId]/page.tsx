'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';

interface Project {
  id: string;
  name: string;
  aspect_ratio: string;
  user_id: string;
}

interface Asset {
  id: string;
  filename: string;
  asset_type: 'video' | 'image' | 'audio';
  file_url: string;
  duration_seconds?: number;
}

export default function StudioPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const supabase = createClient();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  async function fetchProject() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/dashboard');
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">Loading studio...</p>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>GarliQ Studio</span>
            </button>
            <div className="h-6 w-px bg-gray-700" />
            <h1 className="text-xl font-semibold">{project.name}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {project.aspect_ratio}
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="h-[calc(100vh-73px)] p-6">
        <div className="h-full flex gap-6">
          <LeftPanel 
            projectId={projectId} 
            onAssetSelect={setSelectedAsset}
          />
          <RightPanel selectedAsset={selectedAsset} />
        </div>
      </main>
    </div>
  );
}