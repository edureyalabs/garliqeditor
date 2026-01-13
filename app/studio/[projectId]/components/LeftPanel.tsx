'use client';

import AssetTabs from './AssetTabs';

interface Asset {
  id: string;
  filename: string;
  asset_type: 'video' | 'image' | 'audio';
  file_url: string;
  duration_seconds?: number;
}

interface LeftPanelProps {
  projectId: string;
  onAssetSelect: (asset: Asset | null) => void;
}

export default function LeftPanel({ projectId, onAssetSelect }: LeftPanelProps) {
  return (
    <div className="flex-[3] bg-gray-800 rounded-lg p-6 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Assets</h2>
      <AssetTabs projectId={projectId} onAssetSelect={onAssetSelect} />
    </div>
  );
}