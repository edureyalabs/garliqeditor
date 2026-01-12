'use client';
import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, Film, LogOut, User, FolderOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Inline Sidebar Component
function Sidebar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };
  
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isActive = (path: string) => pathname.startsWith(path);
  
  return (
    <div className="w-64 bg-black border-r border-gray-800 flex flex-col h-screen">
      {/* User Email Section at Top */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Workspace</p>
            <p className="text-sm text-white font-medium truncate" title={userEmail}>
              {userEmail || 'Loading...'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        <button
          onClick={() => router.push('/dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive('/dashboard') || isActive('/studio')
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:bg-gray-900'
          }`}
        >
          <Film className="w-5 h-5" />
          <span className="font-medium">Projects</span>
        </button>
        
        <button
          onClick={() => router.push('/assets')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive('/assets')
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:bg-gray-900'
          }`}
        >
          <FolderOpen className="w-5 h-5" />
          <span className="font-medium">Assets</span>
        </button>
      </div>
      
      {/* Logo at Bottom */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Image src="/logo.png" alt="GarliQ" width={32} height={32} />
          <span className="text-white font-bold text-lg">GarliQ</span>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-900 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

interface Project {
  id: string;
  name: string;
  aspect_ratio: '9:16' | '16:9';
  updated_at: string;
  has_final_version: boolean;
  final_video_url: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth');
    } else {
      setUser(session.user);
      loadProjects(session.user.id);
    }
  };

  const loadProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('project_summary')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image 
            src="/logo.png" 
            alt="GarliQ" 
            width={60} 
            height={60}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto bg-gray-950">
        {/* Subtle Grid Background */}
        <div className="fixed inset-0 bg-gray-950 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">My Projects</h1>
            <button
              onClick={() => router.push('/create-project')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image 
                  src="/logo.png" 
                  alt="Loading" 
                  width={60} 
                  height={60}
                />
              </motion.div>
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Film className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-400 mb-4 text-lg">No projects yet</p>
              <button
                onClick={() => router.push('/create-project')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Your First Project
              </button>
            </motion.div>
          ) : (
            /* Projects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => router.push(`/studio/${project.id}`)}
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-purple-600 transition-all cursor-pointer group"
                >
                  {/* Video Thumbnail */}
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    {project.final_video_url ? (
                      <video
                        src={project.final_video_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="w-12 h-12 text-gray-600 group-hover:text-purple-500 transition-colors" />
                    )}
                  </div>
                  
                  {/* Project Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 truncate">
                      {project.name}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className="px-2 py-1 bg-gray-800 rounded text-xs font-medium">
                        {project.aspect_ratio}
                      </span>
                      <span>
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}