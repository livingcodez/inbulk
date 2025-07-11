import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
    addOrUpdateParticipantDeliveryAddress,
    getParticipantDeliveryAddress,
    addUserProfileAddress, // For optionally saving to profile
    listUserProfileAddresses, // To check if address already exists in profile
    type ParticipantDeliveryAddressInput,
    type UserProfileAddressInput
} from '@/lib/supabase/addresses';
import { getGroupMemberById } from '@/lib/supabase/groups'; // Assuming a function to get group member details

// GET: Retrieve the submitted delivery address for this specific group membership
export async function GET(request: NextRequest, { params }: { params: { groupId: string; memberId: string } }) {
  const { memberId } = params; // memberId is the group_member_id
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!memberId) {
    return NextResponse.json({ error: 'Group Member ID is required' }, { status: 400 });
  }

  try {
    // RLS on participant_delivery_addresses should ensure user can only fetch their own.
    // The getParticipantDeliveryAddress function also takes userId for an explicit check.
    const { data: address, error } = await getParticipantDeliveryAddress(user.id, memberId);
    if (error) {
      console.error(`GET /api/.../delivery-address: Supabase error getting participant address for member ${memberId}`, error);
      return NextResponse.json({ error: error.message || 'Failed to retrieve address' }, { status: 500 });
    }
    if (!address) {
      return NextResponse.json({ error: 'Delivery address not found for this group membership.' }, { status: 404 });
    }
    return NextResponse.json(address, { status: 200 });
  } catch (e: any) {
    console.error(`GET /api/.../delivery-address: Exception for member ${memberId}`, e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}


// POST or PUT: Add or Update delivery address for a specific group membership
// Using POST for simplicity, can be PUT if strict idempotency is desired for updates.
export async function POST(request: NextRequest, { params }: { params: { groupId: string; memberId: string } }) {
  const { groupId, memberId } = params; // memberId is group_member_id
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!groupId || !memberId) {
    return NextResponse.json({ error: 'Group ID and Group Member ID are required' }, { status: 400 });
  }

  let requestBody: { address: ParticipantDeliveryAddressInput; saveToProfile?: boolean; makeDefault?: boolean };
  try {
    requestBody = await request.json();
    if (!requestBody.address) {
        throw new Error("Address data is missing in request body.");
    }
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body or missing address data' }, { status: 400 });
  }

  const { address: addressDetails, saveToProfile = false, makeDefault = false } = requestBody;


  // Validate that the authenticated user is the owner of this group_member_id
  try {
    const groupMember = await getGroupMemberById(memberId); // You'll need to create/use this function
    if (!groupMember || groupMember.user_id !== user.id || groupMember.group_id !== groupId) {
      return NextResponse.json({ error: 'Forbidden: You do not own this group membership or IDs mismatch.' }, { status: 403 });
    }
  } catch (e: any) {
    console.error("Error validating group member ownership:", e.message);
    return NextResponse.json({ error: 'Could not verify group membership.' }, { status: 500 });
  }

  // Basic validation for address (more can be added in lib function)
  if (!addressDetails.full_name || !addressDetails.address_line_1 || !addressDetails.city || !addressDetails.state_province_region || !addressDetails.postal_code || !addressDetails.country) {
    return NextResponse.json({ error: 'Missing required address fields.' }, { status: 400 });
  }

  try {
    // Save/Update address for the specific group participation
    const { data: participantAddress, error: participantAddrError } =
      await addOrUpdateParticipantDeliveryAddress(user.id, memberId, addressDetails);

    if (participantAddrError) {
      console.error('Error saving participant delivery address:', participantAddrError);
      return NextResponse.json({ error: participantAddrError.message || 'Failed to save delivery address for group participation.' }, { status: 500 });
    }

    // If saveToProfile is true, also save/update to user_profile_addresses
    if (saveToProfile && participantAddress) { // Ensure participantAddress was successfully saved
      const profileAddressInput: UserProfileAddressInput = {
        address_label: addressDetails.address_label || 'Saved from Order', // Or derive a label
        is_default: makeDefault, // Use the makeDefault flag from request
        full_name: addressDetails.full_name,
        address_line_1: addressDetails.address_line_1,
        address_line_2: addressDetails.address_line_2,
        city: addressDetails.city,
        state_province_region: addressDetails.state_province_region,
        postal_code: addressDetails.postal_code,
        country: addressDetails.country,
        phone_number: addressDetails.phone_number,
      };

      // Optional: Check if an identical address already exists in profile to avoid duplicates
      // This is a simplified check; more robust would compare all fields.
      const {data: existingProfileAddresses, error: listError} = await listUserProfileAddresses(user.id);
      let existingAddress = null;
      if (!listError && existingProfileAddresses) {
          existingAddress = existingProfileAddresses.find(pa =>
            pa.address_line_1 === profileAddressInput.address_line_1 &&
            pa.postal_code === profileAddressInput.postal_code &&
            pa.full_name === profileAddressInput.full_name
            // Add more fields for robust check if needed
          );
      }

      if (existingAddress) {
        // If an identical address exists and user wants to make it default
        if (makeDefault && !existingAddress.is_default) {
            await addUserProfileAddress(user.id, {...profileAddressInput, is_default: true}); // This will handle unsetting other defaults
        }
        // If not making default, or it's already default, no action needed on existing profile address.
      } else {
        // If no identical address, add it. The is_default logic is handled by addUserProfileAddress.
        await addUserProfileAddress(user.id, profileAddressInput);
      }
    }

    return NextResponse.json(participantAddress, { status: 201 }); // Return the address saved for participation

  } catch (e: any) {
    console.error('POST /api/.../delivery-address: Exception', e);
    return NextResponse.json({ error: e.message || 'An unexpected error occurred while saving address.' }, { status: 500 });
  }
}
