import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  addUserProfileAddress,
  listUserProfileAddresses,
  type UserProfileAddressInput
} from '@/lib/supabase/addresses';

// GET: List all profile addresses for the authenticated user
export async function GET(request: Request) {
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await listUserProfileAddresses(user.id);
    if (error) {
      console.error('GET /api/profile/addresses: Supabase error listing addresses', error);
      return NextResponse.json({ error: error.message || 'Failed to list profile addresses' }, { status: 500 });
    }
    return NextResponse.json(data || [], { status: 200 });
  } catch (e: any) {
    console.error('GET /api/profile/addresses: Exception listing addresses', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST: Add a new address to the authenticated user's profile
export async function POST(request: Request) {
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let addressDetails: UserProfileAddressInput;
  try {
    addressDetails = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Basic validation (more detailed validation is in the lib function)
  if (!addressDetails.full_name || !addressDetails.address_line_1 || !addressDetails.city || !addressDetails.state_province_region || !addressDetails.postal_code || !addressDetails.country) {
    return NextResponse.json({ error: 'Missing required address fields.' }, { status: 400 });
  }

  try {
    // addUserProfileAddress handles the logic for is_default, including unsetting other defaults.
    const { data: newAddress, error } = await addUserProfileAddress(user.id, addressDetails);
    if (error) {
      console.error('POST /api/profile/addresses: Supabase error creating profile address', error);
      return NextResponse.json({ error: error.message || 'Failed to create profile address' }, { status: 500 });
    }
    return NextResponse.json(newAddress, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/profile/addresses: Exception creating address', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
