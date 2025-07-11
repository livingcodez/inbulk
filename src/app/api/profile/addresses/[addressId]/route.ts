import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  // getUserProfileAddressById, // We don't have this specific function, listUserProfileAddresses is usually enough or RLS handles GET
  updateUserProfileAddress,
  deleteUserProfileAddress,
  setDefaultUserProfileAddress, // For explicitly setting default
  listUserProfileAddresses, // To fetch the specific address ensuring ownership via RLS
  type UserProfileAddressInput,
  type UserProfileAddress
} from '@/lib/supabase/addresses';

// GET: Retrieve a specific profile address by ID
export async function GET(request: NextRequest, context: { params: { addressId: string } }) {
  const { addressId } = await context.params;
  if (!addressId) {
    return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all addresses and filter, relying on RLS in listUserProfileAddresses
    // This ensures we only try to find an address the user actually owns.
    const { data: addresses, error: listError } = await listUserProfileAddresses(user.id);
    if (listError) throw listError;

    const address = addresses?.find(addr => addr.id === addressId);

    if (!address) {
      return NextResponse.json({ error: 'Profile address not found or access denied' }, { status: 404 });
    }
    return NextResponse.json(address, { status: 200 });
  } catch (e: any) {
    console.error(`GET /api/profile/addresses/${addressId}: Exception`, e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

// PUT: Update a specific profile address by ID
export async function PUT(request: NextRequest, context: { params: { addressId: string } }) {
  const { addressId } = await context.params;
  if (!addressId) {
    return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let updates: Partial<UserProfileAddressInput & { set_as_default?: boolean }>; // Allow a special flag for setting default
  try {
    updates = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    let updatedAddress: UserProfileAddress | null = null;
    let updateError: any = null;

    if (updates.set_as_default === true) {
      // Explicitly set this address as default
      // The `is_default` field in `updates` itself might be true or false or undefined.
      // `setDefaultUserProfileAddress` handles unsetting other defaults.
      const { data, error } = await setDefaultUserProfileAddress(addressId, user.id);
      updatedAddress = data;
      updateError = error;
      // If other fields also need updating in the same request:
      if (!updateError && Object.keys(updates).filter(k => k !== 'set_as_default').length > 0) {
        const otherUpdates = {...updates};
        delete otherUpdates.set_as_default; // remove our special flag
        // ensure is_default is true if set_as_default was true, even if not in original updates
        otherUpdates.is_default = true;
        const {data: furtherUpdatedData, error: furtherUpdateError} = await updateUserProfileAddress(addressId, user.id, otherUpdates);
        updatedAddress = furtherUpdatedData; // Take the latest version
        updateError = furtherUpdateError; // Prioritize error from further update
      }
    } else {
      // Standard update, potentially including 'is_default' field directly
      // updateUserProfileAddress handles unsetting other defaults if updates.is_default is true
      const regularUpdates = {...updates};
      delete regularUpdates.set_as_default;
      const { data, error } = await updateUserProfileAddress(addressId, user.id, regularUpdates);
      updatedAddress = data;
      updateError = error;
    }

    if (updateError) {
      console.error(`PUT /api/profile/addresses/${addressId}: Supabase error`, updateError);
      return NextResponse.json({ error: updateError.message || 'Profile address not found or update failed' }, { status: 404 }); // 404 if ID not found for user
    }
     if (!updatedAddress) {
        return NextResponse.json({ error: 'Profile address not found or update failed' }, { status: 404 });
    }
    return NextResponse.json(updatedAddress, { status: 200 });
  } catch (e: any) {
    console.error(`PUT /api/profile/addresses/${addressId}: Exception`, e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE: Delete a specific profile address by ID
export async function DELETE(request: NextRequest, context: { params: { addressId: string } }) {
  const { addressId } = await context.params;
  if (!addressId) {
    return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await deleteUserProfileAddress(addressId, user.id); // RLS in lib function ensures ownership
    if (error) {
      console.error(`DELETE /api/profile/addresses/${addressId}: Supabase error`, error);
      return NextResponse.json({ error: error.message || 'Profile address not found or deletion failed' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Profile address deleted successfully' }, { status: 200 }); // or 204
  } catch (e: any) {
    console.error(`DELETE /api/profile/addresses/${addressId}: Exception`, e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
