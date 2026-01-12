import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CLOUDFLARE_STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN!;

// Cloudflare video upload functions
async function uploadVideoToCloudflare(file: File) {
  console.log('Creating Cloudflare upload URL for:', file.name);

  const createResponse = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        maxDurationSeconds: 600,
        requireSignedURLs: false,
        allowedOrigins: ['*']
      })
    }
  );

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error('Failed to create upload URL:', errorText);
    throw new Error(`Failed to create upload URL: ${createResponse.status}`);
  }

  const createData = await createResponse.json();
  const { uploadURL, uid } = createData.result;

  console.log('Uploading video to Cloudflare, UID:', uid);

const arrayBuffer = await file.arrayBuffer();
  
  // Create FormData - Cloudflare expects multipart/form-data with a 'file' field
  const formData = new FormData();
  formData.append('file', new Blob([arrayBuffer], { type: file.type }), file.name);
  
  const uploadResponse = await fetch(uploadURL, {
    method: 'POST',
    body: formData
    // Don't add headers - let fetch set Content-Type automatically with boundary
  });

  if (!uploadResponse.ok) {
    // Get detailed error from Cloudflare
    const errorText = await uploadResponse.text();
    console.error('Cloudflare upload failed:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      error: errorText
    });
    throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
  }

  console.log('Video uploaded, waiting for processing...');
  await waitForProcessing(uid);

  const videoInfo = await getVideoInfo(uid);
  const hlsUrl = videoInfo.playback?.hls || `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${uid}/manifest/video.m3u8`;

  return { uid, hlsUrl, duration: videoInfo.duration || 0 };
}

async function waitForProcessing(uid: string) {
  const maxWait = 300000; // 5 minutes
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const info = await getVideoInfo(uid);
    const state = info.status?.state;

    console.log('Processing status:', state);

    if (state === 'ready') return;
    if (state === 'error') throw new Error('Video processing failed');

    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error('Video processing timeout');
}

async function getVideoInfo(uid: string) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${uid}`,
    { headers: { 'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}` } }
  );

  if (!response.ok) throw new Error('Failed to get video info');
  const data = await response.json();
  return data.result;
}

async function uploadToSupabaseStorage(file: File, userId: string, type: 'image' | 'audio') {
  const supabase = await createServerClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const bucket = type === 'image' ? 'user-images' : 'user-audio';

  const arrayBuffer = await file.arrayBuffer();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== Upload request received ===');

    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const assetType = formData.get('type') as 'video' | 'image' | 'audio';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileSizeMB = file.size / (1024 * 1024);
    console.log('File details:', { name: file.name, type: assetType, sizeMB: fileSizeMB.toFixed(2) });

    if (fileSizeMB > 50) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
    }

    // Check storage limit
    const { data: assets } = await supabase
      .from('user_assets')
      .select('file_size_mb')
      .eq('user_id', user.id);

    const currentUsage = assets?.reduce((sum, a) => sum + a.file_size_mb, 0) || 0;

    // Get tier limit (default tier 0 = 500MB)
    const { data: tierData } = await supabase
      .from('storage_tiers')
      .select('storage_limit_mb')
      .eq('tier_level', 0)
      .single();

    const storageLimit = tierData?.storage_limit_mb || 500;

    if (currentUsage + fileSizeMB > storageLimit) {
      return NextResponse.json({
        error: `Storage limit exceeded. You have ${(storageLimit - currentUsage).toFixed(2)}MB remaining.`
      }, { status: 400 });
    }

    let fileUrl = '';
    let cloudflareUid = null;
    let duration = null;

    // Upload based on type
    if (assetType === 'video') {
      const result = await uploadVideoToCloudflare(file);
      fileUrl = result.hlsUrl;
      cloudflareUid = result.uid;
      duration = result.duration;
    } else {
      fileUrl = await uploadToSupabaseStorage(file, user.id, assetType);
    }

    // Save to database
    const { data: asset, error: insertError } = await supabase
      .from('user_assets')
      .insert({
        user_id: user.id,
        asset_type: assetType,
        filename: file.name,
        file_url: fileUrl,
        cloudflare_uid: cloudflareUid,
        file_size_mb: fileSizeMB,
        duration_seconds: duration,
        metadata: {}
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('=== Upload complete successfully ===');
    return NextResponse.json({ success: true, asset });

  } catch (error: any) {
    console.error('=== Upload failed ===', error);
    return NextResponse.json({
      error: error.message || 'Upload failed'
    }, { status: 500 });
  }
}