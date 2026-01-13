'use client';

interface Asset {
  id: string;
  filename: string;
  asset_type: 'video' | 'image' | 'audio';
  file_url: string;
  duration_seconds?: number;
}

interface RightPanelProps {
  selectedAsset: Asset | null;
}

export default function RightPanel({ selectedAsset }: RightPanelProps) {
  if (!selectedAsset) {
    return (
      <div className="flex-[7] bg-gray-800 rounded-lg p-6 flex items-center justify-center">
        <p className="text-gray-400">Select an asset to preview</p>
      </div>
    );
  }

  return (
    <div className="flex-[7] bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Preview</h2>
      
      <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[500px]">
        {selectedAsset.asset_type === 'video' && (
          <video
            key={selectedAsset.id}
            src={selectedAsset.file_url}
            controls
            className="max-w-full max-h-[70vh]"
          >
            Your browser does not support video playback.
          </video>
        )}

        {selectedAsset.asset_type === 'image' && (
          <img
            src={selectedAsset.file_url}
            alt={selectedAsset.filename}
            className="max-w-full max-h-[70vh] object-contain"
          />
        )}

        {selectedAsset.asset_type === 'audio' && (
          <div className="w-full max-w-xl p-8">
            <p className="text-white text-center mb-4">{selectedAsset.filename}</p>
            <audio
              key={selectedAsset.id}
              src={selectedAsset.file_url}
              controls
              className="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}