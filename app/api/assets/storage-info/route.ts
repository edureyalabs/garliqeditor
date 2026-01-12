import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's total storage usage
    const { data: assets, error: assetsError } = await supabase
      .from('user_assets')
      .select('file_size_mb')
      .eq('user_id', user.id);

    if (assetsError) throw assetsError;

    const totalUsageMB = assets?.reduce((sum: number, asset: any) => sum + asset.file_size_mb, 0) || 0;

    // Get user's tier level (default to 0 for free tier)
    const tierLevel = 0;

    // Get storage limit from storage_tiers table
    const { data: tierData, error: tierError } = await supabase
      .from('storage_tiers')
      .select('storage_limit_mb')
      .eq('tier_level', tierLevel)
      .single();

    if (tierError) throw tierError;

    const storageLimitMB = tierData.storage_limit_mb;

    return NextResponse.json({
      success: true,
      usage: {
        used: totalUsageMB,
        limit: storageLimitMB,
        percentage: (totalUsageMB / storageLimitMB) * 100
      }
    });
  } catch (error: any) {
    console.error('Storage info error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}