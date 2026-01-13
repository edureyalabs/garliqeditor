'use client';

import { X } from 'lucide-react';

interface Asset {
  id: string;
  filename: string;
  asset_type: 'video' | 'image' | 'audio';
  file_url: string;
  duration_seconds?: number;
}

interface AssetListProps {
  assets: Asset[];
  onRemove: (assetId: string, position: number) => void;
  onSelect: (asset: Asset) => void;
  selectedAssetId?: string;
}

export default function AssetList({ assets, onRemove, onSelect, selectedAssetId }: AssetListProps) {
  return (
    <div className="space-y-2">
      {assets.map((asset, index) => (
        <div
          key={`${asset.id}-${index}`}
          onClick={() => onSelect(asset)}
          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
            selectedAssetId === asset.id
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{asset.filename}</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="capitalize">{asset.asset_type}</span>
              {asset.duration_seconds && (
                <>
                  <span>•</span>
                  <span>{asset.duration_seconds.toFixed(1)}s</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(asset.id, index);
            }}
            className="ml-2 p-1 hover:bg-red-600 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}