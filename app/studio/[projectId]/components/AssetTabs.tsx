'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus } from 'lucide-react';
import AssetList from './AssetList';

const MAX_BASE_CLIPS = 10;
const MAX_CLIPPER_CLIPS = 10;

interface Asset {
  id: string;
  filename: string;
  asset_type: 'video' | 'image' | 'audio';
  file_url: string;
  duration_seconds?: number;
}

interface ProjectAsset extends Asset {
  position: number;
  va_id: string;
}

interface AssetTabsProps {
  projectId: string;
  onAssetSelect: (asset: Asset | null) => void;
}

type TabType = 'base' | 'clippers' | 'bgm';

export default function AssetTabs({ projectId, onAssetSelect }: AssetTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('base');
  const [baseAssets, setBaseAssets] = useState<ProjectAsset[]>([]);
  const [clipperAssets, setClipperAssets] = useState<ProjectAsset[]>([]);
  const [bgmAsset, setBgmAsset] = useState<ProjectAsset | null>(null);
  const [userAssets, setUserAssets] = useState<Asset[]>([]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  
  const supabase = createClient();

  useEffect(() => {
    fetchProjectAssets();
    fetchUserAssets();
  }, [projectId]);

async function fetchProjectAssets() {
  try {
    // Fetch base assets
    const { data: baseData } = await supabase
      .from('va_base')
      .select(`
        id,
        position,
        asset_id,
        user_assets!inner (
          id,
          filename,
          asset_type,
          file_url,
          duration_seconds
        )
      `)
      .eq('project_id', projectId)
      .order('position');

    // Fetch clipper assets
    const { data: clipperData } = await supabase
      .from('va_clippers')
      .select(`
        id,
        position,
        asset_id,
        user_assets!inner (
          id,
          filename,
          asset_type,
          file_url,
          duration_seconds
        )
      `)
      .eq('project_id', projectId)
      .order('position');

    // Fetch BGM
    const { data: bgmData } = await supabase
      .from('va_bgm')
      .select(`
        id,
        asset_id,
        user_assets!inner (
          id,
          filename,
          asset_type,
          file_url,
          duration_seconds
        )
      `)
      .eq('project_id', projectId)
      .single();

    if (baseData) {
      setBaseAssets(baseData.map((item: any) => {
        const asset = Array.isArray(item.user_assets) ? item.user_assets[0] : item.user_assets;
        return {
          id: asset.id,
          filename: asset.filename,
          asset_type: asset.asset_type,
          file_url: asset.file_url,
          duration_seconds: asset.duration_seconds,
          position: item.position,
          va_id: item.id
        };
      }));
    }

    if (clipperData) {
      setClipperAssets(clipperData.map((item: any) => {
        const asset = Array.isArray(item.user_assets) ? item.user_assets[0] : item.user_assets;
        return {
          id: asset.id,
          filename: asset.filename,
          asset_type: asset.asset_type,
          file_url: asset.file_url,
          duration_seconds: asset.duration_seconds,
          position: item.position,
          va_id: item.id
        };
      }));
    }

    if (bgmData && bgmData.user_assets) {
      const asset = Array.isArray(bgmData.user_assets) ? bgmData.user_assets[0] : bgmData.user_assets;
      setBgmAsset({
        id: asset.id,
        filename: asset.filename,
        asset_type: asset.asset_type,
        file_url: asset.file_url,
        duration_seconds: asset.duration_seconds,
        position: 0,
        va_id: bgmData.id
      });
    }
  } catch (error) {
    console.error('Error fetching project assets:', error);
  }
}

  async function fetchUserAssets() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (data) setUserAssets(data);
    } catch (error) {
      console.error('Error fetching user assets:', error);
    }
  }

  async function addAsset(asset: Asset) {
    try {
      if (activeTab === 'base') {
        if (baseAssets.length >= MAX_BASE_CLIPS) {
          alert(`Maximum ${MAX_BASE_CLIPS} base clips allowed`);
          return;
        }
        
        const { error } = await supabase
          .from('va_base')
          .insert({
            project_id: projectId,
            asset_id: asset.id,
            position: baseAssets.length
          });

        if (error) throw error;
      } else if (activeTab === 'clippers') {
        if (clipperAssets.length >= MAX_CLIPPER_CLIPS) {
          alert(`Maximum ${MAX_CLIPPER_CLIPS} clipper clips allowed`);
          return;
        }

        const { error } = await supabase
          .from('va_clippers')
          .insert({
            project_id: projectId,
            asset_id: asset.id,
            position: clipperAssets.length
          });

        if (error) throw error;
      } else if (activeTab === 'bgm') {
        if (bgmAsset) {
          alert('Only one BGM allowed. Remove existing BGM first.');
          return;
        }

        const { error } = await supabase
          .from('va_bgm')
          .insert({
            project_id: projectId,
            asset_id: asset.id
          });

        if (error) throw error;
      }

      await fetchProjectAssets();
      setShowAssetPicker(false);
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset');
    }
  }

  async function removeAsset(assetId: string, position: number) {
    try {
      if (activeTab === 'base') {
        // Delete the asset
        const { error } = await supabase
          .from('va_base')
          .delete()
          .eq('project_id', projectId)
          .eq('position', position);

        if (error) throw error;

        // Reorder remaining assets
        for (let i = position + 1; i < baseAssets.length; i++) {
          await supabase
            .from('va_base')
            .update({ position: i - 1 })
            .eq('project_id', projectId)
            .eq('position', i);
        }
      } else if (activeTab === 'clippers') {
        const { error } = await supabase
          .from('va_clippers')
          .delete()
          .eq('project_id', projectId)
          .eq('position', position);

        if (error) throw error;

        // Reorder
        for (let i = position + 1; i < clipperAssets.length; i++) {
          await supabase
            .from('va_clippers')
            .update({ position: i - 1 })
            .eq('project_id', projectId)
            .eq('position', i);
        }
      } else if (activeTab === 'bgm') {
        const { error } = await supabase
          .from('va_bgm')
          .delete()
          .eq('project_id', projectId);

        if (error) throw error;
      }

      await fetchProjectAssets();
      onAssetSelect(null);
      setSelectedAssetId(undefined);
    } catch (error) {
      console.error('Error removing asset:', error);
      alert('Failed to remove asset');
    }
  }

  function handleAssetSelect(asset: Asset) {
    setSelectedAssetId(asset.id);
    onAssetSelect(asset);
  }

  const getFilteredUserAssets = () => {
    if (activeTab === 'base') {
      return userAssets.filter(a => a.asset_type === 'video');
    } else if (activeTab === 'clippers') {
      return userAssets.filter(a => a.asset_type === 'video' || a.asset_type === 'image');
    } else {
      return userAssets.filter(a => a.asset_type === 'audio');
    }
  };

  const getCurrentAssets = () => {
    if (activeTab === 'base') return baseAssets;
    if (activeTab === 'clippers') return clipperAssets;
    return bgmAsset ? [bgmAsset] : [];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('base')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'base'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Base ({baseAssets.length}/{MAX_BASE_CLIPS})
        </button>
        <button
          onClick={() => setActiveTab('clippers')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'clippers'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Clippers ({clipperAssets.length}/{MAX_CLIPPER_CLIPS})
        </button>
        <button
          onClick={() => setActiveTab('bgm')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'bgm'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          BGM ({bgmAsset ? 1 : 0}/1)
        </button>
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto">
        <AssetList
          assets={getCurrentAssets()}
          onRemove={removeAsset}
          onSelect={handleAssetSelect}
          selectedAssetId={selectedAssetId}
        />
      </div>

      {/* Add Asset Button */}
      <div className="mt-4">
        <button
          onClick={() => setShowAssetPicker(!showAssetPicker)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Add {activeTab === 'base' ? 'Clip' : activeTab === 'clippers' ? 'Clipper' : 'BGM'}</span>
        </button>
      </div>

      {/* Asset Picker Modal */}
      {showAssetPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Select Asset</h3>
            <div className="space-y-2">
              {getFilteredUserAssets().map(asset => (
                <div
                  key={asset.id}
                  onClick={() => addAsset(asset)}
                  className="flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium">{asset.filename}</p>
                    <p className="text-sm text-gray-400 capitalize">{asset.asset_type}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAssetPicker(false)}
              className="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}