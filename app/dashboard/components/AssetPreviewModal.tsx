'use client';

import { X } from 'lucide-react';

interface Asset {
  id: string;
  asset_type: 'video' | 'image' | 'audio';
  filename: string;
  file_url: string;
  cloudflare_uid: string | null;
  file_size_mb: number;
  duration_seconds: number | null;
}

interface AssetPreviewModalProps {
  asset: Asset | null;
  onClose: () => void;
}

export default function AssetPreviewModal({ asset, onClose }: AssetPreviewModalProps) {
  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-gray-900 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 className="text-white font-semibold truncate pr-4">{asset.filename}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {asset.asset_type === 'video' && asset.cloudflare_uid ? (
            <div className="aspect-video w-full">
              <iframe
                src={`https://iframe.videodelivery.net/${asset.cloudflare_uid}`}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : asset.asset_type === 'video' ? (
            <video
              src={asset.file_url}
              controls
              className="w-full rounded-lg"
            />
          ) : asset.asset_type === 'image' ? (
            <img
              src={asset.file_url}
              alt={asset.filename}
              className="w-full rounded-lg"
            />
          ) : asset.asset_type === 'audio' ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <audio
                src={asset.file_url}
                controls
                className="w-full"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}