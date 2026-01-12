'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, Trash2, Film, Image as ImageIcon, Music, Loader2 } from 'lucide-react';
import { formatFileSize, formatDuration, getAcceptType } from '@/lib/utils';
import AssetPreviewModal from './AssetPreviewModal';

interface Asset {
  id: string;
  asset_type: 'video' | 'image' | 'audio';
  filename: string;
  file_url: string;
  cloudflare_uid: string | null;
  file_size_mb: number;
  duration_seconds: number | null;
  uploaded_at: string;
}

interface StorageUsage {
  used: number;
  limit: number;
  percentage: number;
}

export default function AssetsSection() {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'audio'>('video');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [storageUsage, setStorageUsage] = useState<StorageUsage>({ used: 0, limit: 500, percentage: 0 });
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadAssets();
    loadStorageInfo();
  }, [activeTab]);

  async function loadAssets() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`/api/assets?type=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      const result = await response.json();
      if (result.success) {
        setAssets(result.assets);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStorageInfo() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/assets/storage-info', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      const result = await response.json();
      if (result.success) {
        setStorageUsage(result.usage);
      }
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      alert('File size exceeds 50MB limit');
      return;
    }

    // Check if upload would exceed storage limit
    if (storageUsage.used + fileSizeMB > storageUsage.limit) {
      alert(`Storage limit exceeded. You have ${(storageUsage.limit - storageUsage.used).toFixed(2)}MB remaining.`);
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', activeTab);

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        await loadAssets();
        await loadStorageInfo();
        alert('Upload successful!');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(assetId: string) {
    if (!confirm('Delete this asset?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/assets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ assetId })
      });

      const result = await response.json();
      if (result.success) {
        await loadAssets();
        await loadStorageInfo();
      }
    } catch (error) {
      alert('Failed to delete asset');
    }
  }

  const tabConfig = {
    video: { icon: Film, label: 'Videos' },
    image: { icon: ImageIcon, label: 'Images' },
    audio: { icon: Music, label: 'Audio' }
  };

  const TabIcon = tabConfig[activeTab].icon;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">Asset Library</h1>

        {/* Storage Usage Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Storage Usage</span>
            <span className="text-sm text-gray-400">
              {storageUsage.used.toFixed(2)} MB / {storageUsage.limit} MB
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                storageUsage.percentage > 90 ? 'bg-red-600' :
                storageUsage.percentage > 70 ? 'bg-yellow-600' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Tabs and Upload Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(Object.keys(tabConfig) as Array<keyof typeof tabConfig>).map((tab) => {
              const Icon = tabConfig[tab].icon;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Icon size={18} />
                  {tabConfig[tab].label}
                </button>
              );
            })}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptType(activeTab)}
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload {tabConfig[activeTab].label}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <TabIcon size={64} className="text-gray-700 mb-4" />
            <p className="text-gray-400 mb-4">
              No {tabConfig[activeTab].label.toLowerCase()} uploaded yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-600 transition-all"
              >
                {/* Thumbnail/Preview */}
                <div
                  className="aspect-video bg-gray-800 flex items-center justify-center cursor-pointer"
                  onClick={() => setPreviewAsset(asset)}
                >
                  {asset.asset_type === 'video' ? (
                    asset.cloudflare_uid ? (
                      <iframe
                        src={`https://iframe.videodelivery.net/${asset.cloudflare_uid}`}
                        className="w-full h-full pointer-events-none"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : (
                      <Film size={48} className="text-gray-600" />
                    )
                  ) : asset.asset_type === 'image' ? (
                    <img
                      src={asset.file_url}
                      alt={asset.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music size={48} className="text-gray-600" />
                  )}
                </div>

                {/* Asset Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-white truncate mb-2">
                    {asset.filename}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>{formatFileSize(asset.file_size_mb * 1024 * 1024)}</span>
                    {asset.duration_seconds && (
                      <span>{formatDuration(asset.duration_seconds)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/10 text-red-400 text-xs rounded-md hover:bg-red-600/20 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AssetPreviewModal
        asset={previewAsset}
        onClose={() => setPreviewAsset(null)}
      />
    </div>
  );
}