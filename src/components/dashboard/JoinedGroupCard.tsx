'use client'

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils'; // Assuming cn utility
import { Users, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'; // Icons for status/vote

// Define the expected prop structure based on getGroupsByUser
// This should ideally come from a shared types file (e.g., database.types.ts or custom types)
interface Product {
  id: string;
  name: string;
  image_url: string | null;
  category: string;
  // Add other product fields if needed for display (e.g., price)
}

interface Group {
  id: string;
  status: string; // e.g., 'open', 'funded', 'failed', 'closed'
  member_count: number;
  target_count: number;
  product_id: string; // For linking
  products: Product; // Nested product details
  // Add other group fields if needed
}

export interface JoinedGroupMembership { // This is the top-level object from getGroupsByUser
  group_id: string;
  user_id: string; // Not directly displayed but good to have
  joined_at: string;
  vote_status?: 'pending' | 'approved' | 'rejected' | null; // From group_members
  groups: Group; // Nested group object which contains the nested product
}

interface JoinedGroupCardProps {
  membership: JoinedGroupMembership;
}

const DEFAULT_GROUP_PRODUCT_IMAGE = '/placeholder-product.png'; // Fallback image

export function JoinedGroupCard({ membership }: JoinedGroupCardProps) {
  const { groups: group } = membership; // Alias for convenience
  const product = group.products; // The actual product

  const getStatusPillClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300';
      case 'funded':
      case 'successful': // Assuming 'successful' might be a status
        return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300';
      case 'failed':
      case 'cancelled': // Assuming 'cancelled' might be a status
        return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300';
      case 'closed': // Generic closed, could be successful or not
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700/30 dark:text-neutral-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300';
    }
  };

  const getVoteStatusInfo = (voteStatus?: 'pending' | 'approved' | 'rejected' | null) => {
    switch (voteStatus) {
        case 'approved':
            return { text: 'Voted: Approved', icon: <CheckCircle className="h-4 w-4 text-green-500" />, color: 'text-green-600 dark:text-green-400' };
        case 'rejected':
            return { text: 'Voted: Rejected', icon: <XCircle className="h-4 w-4 text-red-500" />, color: 'text-red-600 dark:text-red-400' };
        case 'pending':
            return { text: 'Vote Pending', icon: <Clock className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-600 dark:text-yellow-400' };
        default:
            return null; // No vote status to display or not applicable
    }
  };

  const voteInfo = getVoteStatusInfo(membership.vote_status);

  return (
    <article className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
      <div className="relative h-40 sm:h-48"> {/* Image container */}
        <Image
          src={product.image_url || DEFAULT_GROUP_PRODUCT_IMAGE}
          alt={product.name}
          fill
          className="object-cover"
        />
        <span
            className={cn(
                "absolute top-2 right-2 text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
                getStatusPillClasses(group.status)
            )}
        >
            {group.status}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{product.category}</p>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 hover:text-primary dark:hover:text-primary-light mb-1 line-clamp-2">
            <Link href={`/products/${product.id}?group_id=${group.id}`}>
              {product.name}
            </Link>
          </h3>

          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-300 mt-2 mb-3">
            <Users className="h-4 w-4 mr-1.5 text-neutral-500 dark:text-neutral-400" />
            <span>{group.member_count} / {group.target_count} members</span>
          </div>

          {voteInfo && (
            <div className={cn("flex items-center text-xs mt-1 mb-2", voteInfo.color)}>
              {voteInfo.icon}
              <span className="ml-1.5">{voteInfo.text}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3">
          <Link
            href={`/products/${product.id}?group_id=${group.id}`} // Link to product page, potentially with group context
            className="block w-full bg-primary hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90 text-white text-center py-2.5 px-4 rounded-md font-medium transition-colors text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
