import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  createUserVendor,
  listUserVendors,
  type UserManagedVendor
} from '@/lib/supabase/userVendors';

// GET: List all vendors for the authenticated user
export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await listUserVendors(user.id);
    if (error) {
      console.error('GET /api/user-vendors: Supabase error listing vendors', error);
      return NextResponse.json({ error: error.message || 'Failed to list vendors' }, { status: 500 });
    }
    return NextResponse.json(data || [], { status: 200 });
  } catch (e: any) {
    console.error('GET /api/user-vendors: Exception listing vendors', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST: Create a new vendor for the authenticated user
export async function POST(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let vendorDetails: Omit<UserManagedVendor, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
  try {
    vendorDetails = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!vendorDetails.vendor_name) {
    return NextResponse.json({ error: 'Vendor name is required' }, { status: 400 });
  }

  try {
    const { data: newVendor, error } = await createUserVendor(user.id, vendorDetails);
    if (error) {
      console.error('POST /api/user-vendors: Supabase error creating vendor', error);
      return NextResponse.json({ error: error.message || 'Failed to create vendor' }, { status: 500 });
    }
    return NextResponse.json(newVendor, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/user-vendors: Exception creating vendor', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
