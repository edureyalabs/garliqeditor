'use client';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Film, FolderOpen, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
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
              {userEmail}
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