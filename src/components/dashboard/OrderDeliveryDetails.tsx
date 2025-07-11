'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, PackageSearch, User, Home, Phone } from 'lucide-react';
import { type ParticipantDeliveryAddress } from '@/lib/supabase/addresses'; // Assuming this type is exported
// We might need a more specific type that includes joined user profile info if API returns it
interface EnrichedParticipantDeliveryAddress extends ParticipantDeliveryAddress {
    group_members?: { // Assuming this structure from getDeliveryAddressesForGroup
        user_profiles: {
            id: string;
            full_name: string | null;
            email: string | null;
        } | null;
    } | null;
}


interface OrderDeliveryDetailsProps {
  groupId: string;
  productTitle: string; // For context
}

export default function OrderDeliveryDetails({ groupId, productTitle }: OrderDeliveryDetailsProps) {
  const [addresses, setAddresses] = useState<EnrichedParticipantDeliveryAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) {
        setError("Group ID is required to fetch delivery details.");
        setIsLoading(false);
        return;
    };

    const fetchDeliveryDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/groups/${groupId}/delivery-addresses`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Failed to fetch delivery details: ${response.statusText} (${response.status})`);
        }
        const data: EnrichedParticipantDeliveryAddress[] = await response.json();
        setAddresses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryDetails();
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-lg text-neutral-600 dark:text-neutral-400">Loading delivery information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded-md flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
        <p><strong>Error:</strong> {error}</p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
        <PackageSearch className="h-16 w-16 text-neutral-400 dark:text-neutral-500 mb-4" />
        <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">No Delivery Addresses Found</h3>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Either no participants have submitted their addresses for &quot;{productTitle}&quot;,
          or this group does not require physical delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
            Delivery Addresses for: <span className="text-primary dark:text-primary-dark">{productTitle}</span> (Group ID: {groupId.substring(0,8)}...)
        </h3>
        <div className="overflow-x-auto bg-white dark:bg-neutral-800 shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-750">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Participant</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Shipping Address</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Contact Phone</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {addresses.map((addr) => (
                    <tr key={addr.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mr-2 flex-shrink-0" />
                        <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                {addr.full_name || addr.group_members?.user_profiles?.full_name || 'N/A'}
                            </div>
                            {addr.group_members?.user_profiles?.email && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {addr.group_members.user_profiles.email}
                                </div>
                            )}
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-neutral-600 dark:text-neutral-300">
                        <div className="flex items-start">
                            <Home className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2 mt-0.5 flex-shrink-0" />
                            <div>
                                {addr.address_line_1} <br />
                                {addr.address_line_2 && <>{addr.address_line_2}<br /></>}
                                {addr.city}, {addr.state_province_region} {addr.postal_code} <br />
                                {addr.country}
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
                        {addr.phone_number ? (
                            <div className="flex items-center">
                                <Phone className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2 flex-shrink-0" />
                                {addr.phone_number}
                            </div>
                        ) : (
                            <span className="text-xs italic text-neutral-400 dark:text-neutral-500">Not provided</span>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4 text-center">
            Please handle this information responsibly and use it solely for fulfillment purposes.
        </p>
    </div>
  );
}
