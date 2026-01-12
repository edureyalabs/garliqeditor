import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const CLOUDFLARE_STREAM_TOKEN = process.env.CLOUDFLARE_STREAM_TOKEN!;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const assetType = url.searchParams.get('type');

    let query = supabase
      .from('user_assets')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (assetType) {
      query = query.eq('asset_type', assetType);
    }

    const { data: assets, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, assets: assets || [] });
  } catch (error: any) {
    console.error('GET assets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId } = await req.json();

    // Get asset details
    const { data: asset, error: fetchError } = await supabase
      .from('user_assets')
      .select('*')
      .eq('id', assetId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Delete from Cloudflare if it's a video
    if (asset.cloudflare_uid && asset.asset_type === 'video') {
      try {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${asset.cloudflare_uid}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${CLOUDFLARE_STREAM_TOKEN}` }
          }
        );
      } catch (error) {
        console.error('Cloudflare delete error:', error);
      }
    } else {
      // Delete from Supabase Storage for images/audio
      const bucket = asset.asset_type === 'image' ? 'user-images' : 'user-audio';
      const filePath = asset.file_url.split(`/${bucket}/`)[1];
      
      if (filePath) {
        try {
          await supabase.storage.from(bucket).remove([filePath]);
        } catch (error) {
          console.error('Storage delete error:', error);
        }
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('user_assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE asset error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}