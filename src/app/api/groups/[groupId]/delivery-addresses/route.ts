import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getDeliveryAddressesForGroup } from '@/lib/supabase/addresses';
import { getProductById, isProductPhysical } from '@/lib/supabase/products'; // To check product vendor and physicality
import { getGroupById } from '@/lib/supabase/groups'; // To check group status

interface RouteParams {
  params: {
    groupId: string;
  };
}

// GET: Retrieve all delivery addresses for a specific group (for fulfillers)
export async function GET(request: Request, { params }: RouteParams) {
  const { groupId } = params;
  if (!groupId) {
    return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Step 1: Validate the group and product
    const group = await getGroupById(groupId); // This should fetch product details too if select is set up
    if (!group || !group.products) {
      return NextResponse.json({ error: 'Group or associated product not found.' }, { status: 404 });
    }

    const product = group.products;

    // Step 2: Authorization Check - Is the current user the vendor for this product?
    // Or, in the future, does the user have a 'fulfillment_center' role with access?
    // For now, only checking against product.vendor_id (lister is fulfiller)
    if (product.vendor_id !== user.id) {
      // TODO: Add check for 'fulfillment_center' role if applicable in future
      return NextResponse.json({ error: 'Forbidden: You are not authorized to view these addresses.' }, { status: 403 });
    }

    // Step 3: Check if the product is physical
    const physicalProduct = await isProductPhysical(product.id);
    if (!physicalProduct) {
      return NextResponse.json({ error: 'This product is not physical and does not require delivery addresses.' }, { status: 400 });
    }

    // Step 4: Check group status (e.g., only allow for 'completed' or 'paid' groups)
    // Adjust the allowed statuses based on your application's workflow
    const allowedStatuses = ['completed', 'paid', 'ready_for_fulfillment']; // Example statuses
    if (!group.status || !allowedStatuses.includes(group.status.toLowerCase())) {
        return NextResponse.json({ error: `Addresses can only be viewed for groups with status: ${allowedStatuses.join(', ')}. Current status: ${group.status}` }, { status: 403 });
    }


    // Step 5: Fetch addresses using the lib function which relies on RLS for final check
    // The fulfillerUserId (user.id) is passed to the lib function, which might use it if RLS wasn't primary,
    // but here RLS on `participant_delivery_addresses` is the main guard based on auth.uid().
    const { data: addresses, error: addressesError } = await getDeliveryAddressesForGroup(groupId, user.id);

    if (addressesError) {
      console.error(`GET /api/groups/${groupId}/delivery-addresses: Supabase error`, addressesError);
      return NextResponse.json({ error: addressesError.message || 'Failed to retrieve delivery addresses' }, { status: 500 });
    }

    return NextResponse.json(addresses || [], { status: 200 });

  } catch (e: any) {
    console.error(`GET /api/groups/${groupId}/delivery-addresses: Exception`, e);
    // Check if the error is from a thrown error in isProductPhysical or getGroupById
    if (e.message.includes("Failed to fetch product details") || e.message.includes("Group or associated product not found")) {
        return NextResponse.json({ error: e.message }, { status: 404 });
    }
    return NextResponse.json({ error: e.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
